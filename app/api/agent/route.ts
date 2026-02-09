import { NextRequest, NextResponse } from 'next/server';
import { generateInsight, queryCreateAI } from '@/lib/createAI';

// Define the agent's memory structure
export type Memory = {
  messages: { role: 'user' | 'assistant'; content: string }[];
  studentId?: string;
  courseId?: string;
  preparationPageId?: string;
}

// Define interfaces for our tools
interface StudentProfile {
  id: string;
  name: string;
  email: string;
  courses: Array<{
    id: string;
    code: string;
    name: string;
  }>;
}

interface StudentPerformance {
  studentId: string;
  courseId: string;
  items: Array<{
    itemId: string;
    title: string;
    type: string;
    attemptsCount: number;
    latestScore: number;
    possiblePoints: number;
  }>;
}

interface InsightResult {
  insight: string;
  error?: string;
}

interface AgentTools {
  getStudentProfile: (params: { studentId: string }) => Promise<StudentProfile>;
  getStudentPerformance: (params: { studentId: string; courseId: string }) => Promise<StudentPerformance>;
  generateInsight: (params: { prompt: string; context?: Record<string, any> }) => Promise<InsightResult>;
}

// Create the AI agent
export const runtime = 'edge';

// Define request interface
interface AgentRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  studentId?: string;
  courseId?: string;
  preparationPageId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, studentId, courseId, preparationPageId }: AgentRequest = await req.json();
    
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
    
    const userMessage = lastMessage.content;
    let response = '';
    
    // Process the message based on content
    if (userMessage.toLowerCase().includes('profile')) {
      // Get student profile
      const profile = await getStudentProfile(studentId || '987654');
      response = `Here is your profile information: Name: ${profile.name}, Email: ${profile.email}`;
    }
    else if (userMessage.toLowerCase().includes('performance') || userMessage.toLowerCase().includes('grades')) {
      // Get student performance
      const performance = await getStudentPerformance(studentId || '987654', courseId || '112233');
      
      response = `Here is your performance summary for course ${performance.courseId}:\n`;
      
      for (const item of performance.items) {
        response += `- ${item.title}: ${item.latestScore}/${item.possiblePoints} (${item.attemptsCount} attempts)\n`;
      }
    }
    else {
      // Generate an insight using CreateAI API
      const insightResult = await queryCreateAI<{ response: string }>(userMessage, {
        modelProvider: 'aws',
        modelName: 'claude4_5_sonnet',
        sessionId: `agent_${studentId || 'unknown'}_${Date.now()}`,
        systemPrompt: 'You are the ASU Study Coach agent, an AI assistant that helps students with their academic needs. Provide concise, helpful responses tailored to the student\'s question.',
        context: {
          studentId,
          courseId,
          preparationPageId,
          previousMessages: messages.slice(0, -1)
        }
      });
      
      response = insightResult.error
        ? 'Sorry, I couldn\'t process that request.'
        : insightResult.data?.response || 'I\'m not sure how to help with that.';
    }
    
    // Update messages with the assistant's response
    const updatedMessages = [...messages, { role: 'assistant' as const, content: response }];
    
    return NextResponse.json({
      messages: updatedMessages,
      response
    });
  } catch (error) {
      // Initial state
      initialMemory: {
        messages: messages || [],
        studentId,
        courseId,
        preparationPageId
      },
      // Available tools for the agent
      tools: {
        // Get student profile tool
        getStudentProfile: async ({ studentId }: { studentId: string }): Promise<StudentProfile> => {
          // In a real implementation, this would query the database
          // For now, we'll return mock data
          return {
            id: studentId,
            name: 'Jordan Student',
            email: 'student@asu.edu',
            courses: [
              { id: '112233', code: 'CSE310', name: 'Data Structures & Algorithms' }
            ]
          };
        },
        // Get student performance tool
        getStudentPerformance: async ({ studentId, courseId }: { studentId: string; courseId: string }): Promise<StudentPerformance> => {
          // This would query the database or CreateAI knowledge base
          // For now, we'll return mock data
          return {
            studentId,
            courseId,
            items: [
              {
                itemId: '5002',
                title: 'Quiz 2: Trees',
                type: 'quiz',
                attemptsCount: 2,
                latestScore: 16,
                possiblePoints: 20
              }
            ]
          };
        },
}

/**
 * Get student profile (mock implementation)
 */
async function getStudentProfile(studentId: string): Promise<StudentProfile> {
  // In a real implementation, this would query the database or API
  // For now, we'll return mock data
  return {
    id: studentId,
    name: 'Jordan Student',
    email: 'student@asu.edu',
    courses: [
      { id: '112233', code: 'CSE310', name: 'Data Structures & Algorithms' }
    ]
  };
}

/**
 * Get student performance (mock implementation)
 */
async function getStudentPerformance(studentId: string, courseId: string): Promise<StudentPerformance> {
  // In a real implementation, this would query the database or API
  // For now, we'll return mock data
  return {
    studentId,
    courseId,
    items: [
      {
        itemId: '5002',
        title: 'Quiz 2: Trees',
        type: 'quiz',
        attemptsCount: 2,
        latestScore: 16,
        possiblePoints: 20
      }
    ]
  };
}
  } catch (error) {
    console.error('Error in agent API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}