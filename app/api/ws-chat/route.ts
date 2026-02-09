import { NextRequest, NextResponse } from 'next/server';
import { createWebSocketPayload, chatWithWebSocket } from '@/lib/createAIWebsocket';
import { StreamResponse } from '@/lib/utils';

// Define interfaces for chat requests and responses
interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  studentId?: string;
  courseId?: string;
  preparationPageId?: string;
  stream?: boolean;
}

// Create the API route
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages, studentId, courseId, preparationPageId, stream = true }: ChatRequest = await req.json();
    
    // Make sure we have messages
    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }
    
    // Extract the last user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Last message must be from user' },
        { status: 400 }
      );
    }
    
    // Prepare context for the AI
    const context = {
      studentId,
      courseId,
      preparationPageId,
      previousMessages: messages.slice(0, -1)
    };
    
    // Construct detailed system prompt
    let systemPrompt = 'You are the ASU Study Coach, an AI-powered study assistant that helps students with their courses.';
    systemPrompt += '\n\nYour goal is to guide student learning rather than providing direct answers. You should:';
    systemPrompt += '\n- Provide scaffolding to help students reach their own understanding';
    systemPrompt += '\n- Ask follow-up questions to engage students in active learning';
    systemPrompt += '\n- Tailor explanations to the student\'s identified learning gaps';
    systemPrompt += '\n- Use the Socratic method when appropriate';
    systemPrompt += '\n- Require student attempt or explanation before providing detailed help';
    
    if (courseId) {
      systemPrompt += `\n\nYou are currently assisting with the course: ${courseId}.`;
      systemPrompt += '\n\nFocus your responses on course-specific content and provide learning support tailored to the student\'s needs.';
    }
    
    // For streaming responses
    if (stream) {
      try {
        // Create a session ID using student info and timestamp
        const sessionId = `student_${studentId || 'unknown'}_course_${courseId || 'unknown'}_${Date.now()}`;
        
        try {
          // Use the WebSocket connection for streaming
          const streamingResponse = await chatWithWebSocket(lastMessage.content, {
            modelProvider: 'aws',
            modelName: 'claude4_5_sonnet',
            sessionId,
            systemPrompt,
            temperature: 0.5,
            context
          });
          
          return new StreamResponse(streamingResponse);
        } catch (error) {
          console.error('WebSocket error:', error);
          
          // Fallback to mock response if WebSocket fails
          const encoder = new TextEncoder();
          const mockStream = new ReadableStream<Uint8Array>({
            async start(controller) {
              const response = "I'm the ASU Study Coach. I'm currently in fallback mode due to connection issues. How can I assist you today?";
              
              // Stream the response word by word to simulate a real stream
              const words = response.split(' ');
              for (const word of words) {
                controller.enqueue(encoder.encode(word + ' '));
                // Add a small delay to simulate streaming
                await new Promise(resolve => setTimeout(resolve, 100));
              }
              controller.close();
            }
          });
          
          return new StreamResponse(mockStream);
        }
      } catch (error) {
        console.error('WebSocket streaming error:', error);
        return NextResponse.json(
          { error: 'Failed to create streaming response' },
          { status: 500 }
        );
      }
    }
    
    // For non-streaming responses, we would need to implement a non-streaming WebSocket call
    // Since WebSockets are primarily for streaming, this is not implemented
    return NextResponse.json(
      { error: 'Non-streaming WebSocket responses are not supported' },
      { status: 501 }
    );
    
  } catch (error) {
    console.error('Error in WebSocket chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process WebSocket chat request' },
      { status: 500 }
    );
  }
}