/**
 * CreateAI API Client
 * Handles authenticated API calls to the CreateAI service
 */

// Types for API calls
export type CreateAIRequest = {
  resource: string;
  method: string;
  details: Record<string, any>;
};

export type QueryRequest = {
  action: string;
  request_source?: string;
  query: string;
  model_provider: string;
  model_name: string;
  session_id?: string;
  context?: Record<string, any>;
  model_params?: {
    temperature?: number;
    system_prompt?: string;
    top_p?: number;
    top_k?: number;
    tools?: any[];
    enable_search?: boolean;
    search_params?: {
      collection?: string;
      source_name?: string[];
      top_k?: number;
      reranker?: boolean;
      retrieval_type?: string;
      output_fields?: string[];
      expr?: string;
    };
    history?: Array<{ query: string; response: string }>;
    enable_history?: boolean;
    response_format?: { type: string };
    stream?: boolean;
  };
};

export type CreateAIResponse<T = any> = {
  status: number;
  data?: T;
  error?: string;
};


/**
 * Makes an authenticated API call to the CreateAI service via the project endpoint
 */
export async function callCreateAI<T = any>(
  request: CreateAIRequest
): Promise<CreateAIResponse<T>> {
  try {
    if (!process.env.CREATE_AI_API_ENDPOINT || !process.env.CREATE_AI_API_TOKEN) {
      throw new Error('CreateAI API configuration missing');
    }
    
    const response = await fetch(process.env.CREATE_AI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CREATE_AI_API_TOKEN}`
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('CreateAI API error:', errorText);
      return {
        status: response.status,
        error: `API error: ${response.status} ${errorText}`
      };
    }
    
    const data = await response.json();
    return {
      status: response.status,
      data
    };
  } catch (error) {
    console.error('CreateAI API call failed:', error);
    return {
      status: 500,
      error: `API call failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Uploads data to the CreateAI knowledge base
 */
export async function uploadToKnowledgeBase(
  projectId: string,
  fileName: string,
  content: string,
  metadata: Record<string, any>,
  tags: string[] = ['student_learning']
): Promise<CreateAIResponse> {
  return callCreateAI({
    resource: 'data',
    method: 'upload',
    details: {
      project_id: projectId,
      db_type: 'opensearch',
      files: [
        {
          file_name: fileName,
          search_tags: tags,
          metadata,
          selected: true,
          visible: true,
          content // Added to provide file content directly
        }
      ]
    }
  });
}

/**
 * Queries the CreateAI knowledge base with filters
 */
export async function queryKnowledgeBase(
  projectId: string,
  query: string,
  filters: string
): Promise<CreateAIResponse> {
  return callCreateAI({
    resource: 'data',
    method: 'query',
    details: {
      project_id: projectId,
      query,
      expr: filters // Filter expression, e.g. "student_id == 987654 && course_id == 112233"
    }
  });
}

/**
 * Generates text completion or insights using CreateAI
 */
export async function generateInsight(
  projectId: string, 
  prompt: string,
  context: Record<string, any> = {}
): Promise<CreateAIResponse<string>> {
  return callCreateAI({
    resource: 'ai',
    method: 'generate',
    details: {
      project_id: projectId,
      prompt,
      context
    }
  });
}

/**
 * Makes a direct query to CreateAI API with optional streaming support
 */
export async function queryCreateAI<T = any>(query: string, options: {
  modelProvider?: string;
  modelName?: string;
  sessionId?: string;
  systemPrompt?: string;
  temperature?: number;
  enableSearch?: boolean;
  searchParams?: {
    collection?: string;
    sourceNames?: string[];
    topK?: number;
    retrievalType?: string;
  };
  context?: Record<string, any>;
  stream?: boolean;
} = {}): Promise<CreateAIResponse<T>> {
  console.log('QueryCreateAI called with options:', { query, ...options });
  try {
    if (!process.env.CREATE_AI_API_ENDPOINT || !process.env.CREATE_AI_API_TOKEN) {
      console.warn('CreateAI API configuration missing, falling back to mock response');
      console.log('Debug - Missing configs:', {
        endpoint: !process.env.CREATE_AI_API_ENDPOINT,
        token: !process.env.CREATE_AI_API_TOKEN
      });
      
      // Instead of returning a mock response, throw an error
      throw new Error('CreateAI API configuration is missing');
      
      /* Previous implementation
      return {
        status: 200,
        data: {
          response: 'This is a mock response because the CreateAI API configuration is missing.'
        } as T
      };
      */
    }
    
    const {
      modelProvider = 'gcp-deepmind',
      modelName = 'geminiflash3',
      sessionId = `session_${Date.now()}`,
      systemPrompt,
      temperature = 0.7,
      context = {},
      stream = false
    } = options;
    
    // Build the request payload for direct query format
    const payload: any = {
      action: 'query',
      request_source: 'override_params',
      query,
      model_provider: modelProvider,
      model_name: modelName,
      session_id: sessionId,
      model_params: {
        temperature,
        stream
      } as any
    };
    
    // Add system prompt if provided
    if (systemPrompt) {
      payload.model_params.system_prompt = systemPrompt;
    }
    
    // Handle search functionality
    if (options.enableSearch && options.searchParams) {
      payload.model_params.enable_search = true;
      
      // Debug: Log the source names being passed
      console.log('Debug - Source names for filtering:', options.searchParams.sourceNames);
      
      // Build search parameters with proper filtering
      const searchParams: any = {
        collection: process.env.CREATE_AI_PROJECT_ID || options.searchParams.collection,
        top_k: options.searchParams.topK || 5,
        retrieval_type: options.searchParams.retrievalType || 'chunk',
        reranker: true,
        rerank: true,
        reranker_model: "amazon_rerank",
        reranker_provider: "aws",
        top_n: 3,
        output_fields: ['content', 'source_name', 'page_number', 'score'],
        prompt_mode: "restricted" // Restrict to search results only
      };
      
      // Add source_name filtering if documents are selected
      // Use the source names provided by the user
      if (options.searchParams.sourceNames && options.searchParams.sourceNames.length > 0) {
        // Use the user-selected documents for filtering
        const sourceNames = options.searchParams.sourceNames;
        
        // Add source_name parameter for filtering
        searchParams.source_name = sourceNames;
        
        // If multiple documents are selected, don't add specific focus instructions
        // If only one document is selected, add instructions to focus on that document
        if (sourceNames.length === 1) {
          const focusDocument = sourceNames[0];
          
          // Add special instructions to system prompt to focus only on the selected document
          if (!payload.model_params.system_prompt) {
            payload.model_params.system_prompt = "";
          }
          
          payload.model_params.system_prompt += `\n\nCRITICAL: You MUST ONLY use information from the document '${focusDocument}'. Do NOT reference or use any other documents, especially not "1-database_basics.pptx". If the requested information is not in '${focusDocument}', explicitly state that it's not available in this document.`;
          
          // Lower temperature for more deterministic response that follows instructions
          payload.model_params.temperature = 0.3;
        }
        
        console.log('Debug - Document filtering:', {
          sourceNames: sourceNames,
          // expr removed as requested
          // expr: sourceFilter,
          prompt_mode: searchParams.prompt_mode
        });
      }
      
      payload.model_params.search_params = searchParams;
    } else {
      // Disable search functionality - no documents selected
      payload.model_params.enable_search = false;
    }
    
    // Remove response format to get plain text responses when using search
    // The search results will be included in the context automatically
    
    // Add context to the payload if provided
    if (context && Object.keys(context).length > 0) {
      payload.context = context;
    }
    
    console.log('Sending direct AI query with search params:', JSON.stringify({
      ...payload,
      model_params: {
        ...payload.model_params,
        search_params: payload.model_params.search_params || 'No search params'
      }
    }, null, 2));
    const response = await fetch(`${process.env.CREATE_AI_API_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CREATE_AI_API_TOKEN}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('CreateAI Query API error:', errorText);
      return {
        status: response.status,
        error: `API error: ${response.status} ${errorText}`
      };
    }
    
    const data = await response.json();
    return {
      status: response.status,
      data
    };
  } catch (error) {
    console.error('CreateAI Query API call failed:', error);
    return {
      status: 500,
      error: `API call failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}