/**
 * CreateAI WebSocket Client
 * Handles streaming interactions with the CreateAI service via WebSockets
 */

// Types for WebSocket API calls
export type WebSocketPayload = {
  action: string;
  session_id?: string;
  project_id?: string;
  query: string;
  model_provider?: string;
  model_name?: string;
  model_params?: {
    temperature?: number;
    system_prompt?: string;
    enable_search?: boolean;
    search_params?: {
      collection?: string;
      source_name?: string[];
      top_k?: number;
      retrieval_type?: string;
    };
    response_format?: { type: string };
    stream?: boolean;
  };
  context?: Record<string, any>;
};

/**
 * Creates a payload for the CreateAI WebSocket API
 */
export function createWebSocketPayload(query: string, options: {
  modelProvider?: string;
  modelName?: string;
  sessionId?: string;
  systemPrompt?: string;
  temperature?: number;
  enableSearch?: boolean;
  context?: Record<string, any>;
} = {}): WebSocketPayload {
  const {
    modelProvider = 'aws',
    modelName = 'claude4_5_sonnet',
    sessionId = `session_${Date.now()}`,
    systemPrompt,
    temperature = 0.7,
    context = {},
    enableSearch = false,
  } = options;

  // Build the WebSocket payload using the format for direct query
  const payload: WebSocketPayload = {
    action: 'query',
    request_source: 'override_params',
    session_id: sessionId,
    query,
    model_provider: modelProvider,
    model_name: modelName,
    model_params: {
      temperature,
      enable_search: enableSearch,
      stream: true
    },
    context: context
  };

  // Add system prompt if provided
  if (systemPrompt) {
    payload.model_params!.system_prompt = systemPrompt;
  }

  return payload;
}

/**
 * Connects to CreateAI WebSocket API and returns a ReadableStream for streaming responses
 */
export function createAIWebSocketStream(payload: WebSocketPayload): ReadableStream<Uint8Array> {
  if (!process.env.CREATE_AI_API_TOKEN) {
    throw new Error('CreateAI API token is missing');
  }

  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      // Create WebSocket connection URL with token
      const token = process.env.CREATE_AI_API_TOKEN;
      // Use the POC environment for WebSocket connection
      const wsUrl = `wss://apiws-main-poc.aiml.asu.edu/?access_token=${token}`;
      
      // Create WebSocket connection
      const ws = new WebSocket(wsUrl);
      
      // Handle WebSocket events
      ws.onopen = () => {
        console.log('WebSocket connection established');
        ws.send(JSON.stringify(payload));
      };
      
      ws.onmessage = (event) => {
        const message = event.data;
        
        // Check if the message indicates end of stream
        if (message && typeof message === 'string' && message.trim().endsWith('<EOS>')) {
          controller.close();
          ws.close();
          return;
        }
        
        // Encode and send the message chunk
        controller.enqueue(encoder.encode(message));
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        controller.error(new Error('WebSocket connection error'));
        ws.close();
      };
      
      ws.onclose = (event) => {
        if (event.code !== 1000) {
          console.error(`WebSocket closed abnormally: ${event.code} - ${event.reason}`);
          controller.error(new Error(`WebSocket closed: ${event.code} - ${event.reason}`));
        } else {
          controller.close();
        }
      };
    },
    
    cancel() {
      // This will be called if the stream is cancelled by the consumer
      console.log('Stream cancelled by consumer');
    }
  });
}

/**
 * Helper function to use WebSocket connection for chat
 */
export async function chatWithWebSocket(query: string, options: {
  modelProvider?: string;
  modelName?: string;
  sessionId?: string;
  systemPrompt?: string;
  temperature?: number;
  context?: Record<string, any>;
} = {}): Promise<ReadableStream<Uint8Array>> {
  try {
    const payload = createWebSocketPayload(query, options);
    return createAIWebSocketStream(payload);
  } catch (error) {
    console.error('Error in WebSocket chat:', error);
    
    // Return a ReadableStream with the error
    const encoder = new TextEncoder();
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`Error: ${error instanceof Error ? error.message : String(error)}`));
        controller.close();
      }
    });
  }
}