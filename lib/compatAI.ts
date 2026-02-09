/**
 * Compatible AI implementation for connecting to the CreateAI API
 * This provides a compatibility layer that mimics the Next.js createAI API but uses our CreateAI client
 */

import { generateInsight, queryKnowledgeBase, queryCreateAI, CreateAIResponse } from './createAI';
// ReadableStream is already available in the Edge runtime
// No need to import EventSourceParserStream as we'll use a custom implementation

// Define memory types
export type Memory = Record<string, any>;

// Define AI configuration
export interface AIConfig<T extends Memory> {
  initialMemory: T;
  tools?: Record<string, (...args: any[]) => any>;
  messages?: (params: {
    memory: T;
    tools: Record<string, (...args: any[]) => any>;
  }) => Promise<{ memory: T; response: any }>;
  run?: (params: {
    memory: T;
    tools: Record<string, (...args: any[]) => any>;
  }) => Promise<{ memory: T; response: any }>;
}

// Compatible AI implementation
export interface CompatAI<T extends Memory> {
  run: () => Promise<{ memory: T; response: any }>;
  streamUI: () => Promise<ReadableStream>;
}

// Create compatibility layer
export function createAI<T extends Memory>(config: AIConfig<T>): CompatAI<T> {
  return {
    run: async () => {
      try {
        // If a run method is provided, use that
        if (config.run) {
          return await config.run({
            memory: { ...config.initialMemory },
            tools: config.tools || {},
          });
        }
        
        // If a messages method is provided, use that
        if (config.messages) {
          return await config.messages({
            memory: { ...config.initialMemory },
            tools: config.tools || {},
          });
        }
        
        // Default response if no methods are provided
        return {
          memory: { ...config.initialMemory },
          response: 'No AI processing method provided.',
        };
      } catch (error) {
        console.error('Error in AI processing:', error);
        return {
          memory: { ...config.initialMemory },
          response: `Error in AI processing: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
    
    // Simpler streaming implementation for Edge runtime
    streamUI: async () => {
      try {
        // Extract necessary data from memory
        const memory = { ...config.initialMemory };
        const prompt = memory.prompt || '';
        const systemPrompt = memory.systemPrompt || '';
        const context = memory.context || {};
        
        // Create a simple mock stream instead of calling the API
        // This works in the Edge runtime without special imports
        return new ReadableStream({
          async start(controller) {
            try {
              // Get a response from the API first
              const apiResponse = await queryCreateAI(prompt, {
                modelProvider: memory.modelProvider || 'aws',
                modelName: memory.modelName || 'claude4_5_sonnet',
                sessionId: `session_${Date.now()}`,
                systemPrompt,
                temperature: memory.temperature || 0.7,
                context,
                // Don't try to stream from API
                stream: false
              });
              
              const response = apiResponse.data?.response || 'No response generated.';
              
              // Split the response into chunks to simulate streaming
              const chunks = response.split(' ');
              for (let i = 0; i < chunks.length; i++) {
                // Add the chunk
                controller.enqueue(chunks[i] + ' ');
                
                // Add a small delay between chunks to simulate streaming
                if (i < chunks.length - 1) {
                  await new Promise(resolve => setTimeout(resolve, 20));
                }
              }
              
              // Close the stream when done
              controller.close();
            } catch (error) {
              console.error('Error in streaming:', error);
              controller.enqueue(`Error: ${error instanceof Error ? error.message : String(error)}`);
              controller.close();
            }
          }
        });
          
      } catch (error) {
        console.error('Error in AI streaming:', error);
        return new ReadableStream({
          start(controller) {
            controller.enqueue(`Error: ${error instanceof Error ? error.message : String(error)}`);
            controller.close();
          }
        });
      }
    }
  };
}

/**
 * Helper function to create a streaming response for Next.js API routes
 */
export async function createAIStream(config: AIConfig<any>): Promise<ReadableStream> {
  const ai = createAI(config);
  return ai.streamUI();
}