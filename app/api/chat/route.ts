import { NextRequest, NextResponse } from 'next/server';
import { queryCreateAI, generateInsight } from '@/lib/createAI';
import { createAIStream } from '@/lib/compatAI';
import { getLearningGaps } from '@/mocks/learning-gaps';
import { StreamResponse } from '@/lib/utils';
// TextEncoder for the Edge runtime
const encoder = new TextEncoder();

// Import mock data for context
import courseItemsData from '@/mocks/course-items.json';
import studentProfileData from '@/mocks/student-profile.json';
import courseMaterialsData from '@/mocks/course-materials.json';

// Define interfaces for chat requests and responses
interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  studentId?: string;
  courseId?: string;
  preparationPageId?: string;
  stream?: boolean;
}

interface ChatResponse {
  response: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
}

// Create the AI chat
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages, studentId, courseId, preparationPageId, stream = false }: ChatRequest = await req.json();
    
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
    
    // Get learning gaps and student information
    const learningGapsData = getLearningGaps(studentId || '', courseId);
    
    // Get student profile information
    const studentProfile = studentProfileData.student;
    const enrolledCourses = studentProfileData.courses;
    
    // Filter course items for this student/course
    const relevantCourseItems = courseId
      ? courseItemsData.course_items.filter(item => 
          item.student_id === studentId && item.course_id === courseId
        )
      : courseItemsData.course_items.filter(item => 
          item.student_id === studentId
        );
          
    // Get course name if courseId is provided
    const courseName = courseId
      ? enrolledCourses.find(c => c.course_id === courseId)?.course_name
      : undefined;
    
    // Prepare enhanced context for the LLM
    const context = {
      studentInfo: {
        id: studentId,
        name: studentProfile?.name || 'Student',
        learningGaps: learningGapsData,
        performanceMetrics: studentProfileData.performance_metrics,
        learningPreferences: studentProfileData.learning_preferences
      },
      courseInfo: courseId ? {
        id: courseId,
        name: courseName,
        items: relevantCourseItems,
        materials: courseMaterialsData
      } : undefined,
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
    
    if (courseId && courseName) {
      systemPrompt += `\n\nYou are currently assisting with the course: ${courseName} (${courseId}).`;
      systemPrompt += '\n\nFocus your responses on course-specific content and provide learning support tailored to the student\'s needs.';
      systemPrompt += '\n\nYour knowledge includes:';
      systemPrompt += '\n- Course materials and topics';
      systemPrompt += '\n- Student\'s performance on assignments and quizzes';
      systemPrompt += '\n- Identified learning gaps and areas for improvement';
      systemPrompt += '\n- Upcoming deadlines and assessments';
      
      // Add context about learning gaps if available
      if (learningGapsData && typeof learningGapsData === 'object' && Object.keys(learningGapsData).length > 0) {
        systemPrompt += '\n\nThe student has shown learning gaps in the following areas:';
        
        const gapTopics = Array.isArray((learningGapsData as any).gaps)
          ? (learningGapsData as any).gaps.map((gap: any) => gap.topic)
          : [];
          
        if (gapTopics.length > 0) {
          gapTopics.forEach((topic: string) => {
            systemPrompt += `\n- ${topic}`;
          });
          systemPrompt += '\n\nPay special attention to these areas in your responses and provide targeted help.';
        }
      }
      
      // Add context about preparation page if available
      if (preparationPageId) {
        systemPrompt += `\n\nThe student is currently on a preparation page for assignment/quiz ID: ${preparationPageId}.`;
        systemPrompt += '\nFocus your assistance on helping them prepare for this specific assessment.';
      }
    }
    
    // Add guidance for attempt-first approach
    systemPrompt += '\n\nIMPORTANT: Before providing full solutions or explanations to problems:';
    systemPrompt += '\n1. First ask the student what they understand about the topic';
    systemPrompt += '\n2. Encourage them to explain their current approach';
    systemPrompt += '\n3. Provide hints and guided questions before revealing complete answers';
    systemPrompt += '\n4. Follow up with checks for understanding';
    systemPrompt += '\n\nYour responses should be helpful, encouraging, and tailored to the student\'s needs, while promoting independent learning.';    
    
    // Set up options for CreateAI API
    const options = {
      modelProvider: 'aws',
      modelName: 'claude4_5_sonnet',
      systemPrompt,
      sessionId: `student_${studentId || 'unknown'}_course_${courseId || 'unknown'}_${Date.now()}`,
      // Disable search since we don't have a project token
      enableSearch: false,
      temperature: 0.5, // Balance between creativity and accuracy
      context,
      stream
    };
    
    // For streaming responses
    if (stream) {
      // Use the streaming API
      const streamingResponse = await createAIStream({
        initialMemory: {
          prompt: lastMessage.content,
          systemPrompt,
          context,
          modelProvider: options.modelProvider,
          modelName: options.modelName,
          sessionId: options.sessionId,
          temperature: options.temperature,
          enableSearch: options.enableSearch
        }
      });
      
      return new StreamResponse(streamingResponse as ReadableStream);
    }
    
    // For regular responses
    let aiResponse = 'I apologize, but I couldn\'t generate a response at this time.';
    
    try {
      // Debug information
      console.log('Debug - API endpoint:', process.env.CREATE_AI_API_ENDPOINT);
      console.log('Debug - API token present:', !!process.env.CREATE_AI_API_TOKEN);
      console.log('Debug - Using options:', JSON.stringify({
        modelProvider: options.modelProvider,
        modelName: options.modelName,
        sessionId: options.sessionId?.substring(0, 10) + '...',
        temperature: options.temperature,
        enableSearch: options.enableSearch,
        hasSystemPrompt: !!options.systemPrompt,
        hasContext: !!options.context
      }));
      
      // Use direct query API which works with our token
      const queryResponse = await queryCreateAI<{ response: string }>(lastMessage.content, options);
      
      if (!queryResponse.error) {
        // Get the response from the query API
        aiResponse = queryResponse.data?.response || aiResponse;
        console.log('Debug - Got successful response');
      } else {
        console.error('CreateAI Query API error:', queryResponse.error);
        aiResponse = 'I apologize, but I\'m having trouble connecting to my knowledge base right now. As your ASU Study Coach, I can still help you with this course material based on my general knowledge.';
      }
    } catch (error) {
      console.error('Unexpected error in chat API:', error);
      aiResponse = 'I apologize, but I\'m having trouble connecting to my knowledge base right now. As your ASU Study Coach, I can still help you with this course material based on my general knowledge.';
    }
    
    // Add the assistant's response to the messages
    const updatedMessages = [...messages, { role: 'assistant' as const, content: aiResponse }];
    
    // Return the response and updated messages
    const response: ChatResponse = {
      response: aiResponse,
      messages: updatedMessages
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}