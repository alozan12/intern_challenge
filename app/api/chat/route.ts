import { NextRequest, NextResponse } from 'next/server';
import { queryCreateAI, generateInsight } from '@/lib/createAI';
import { createAIStream } from '@/lib/compatAI';
import { getLearningGaps } from '@/mocks/learning-gaps';
import { StreamResponse } from '@/lib/utils';
// Import prompt templates
import {
  studyCoachSystemPrompt,
  courseSpecificPrompt,
  learningGapsPrompt,
  preparationPagePrompt,
  attemptFirstGuidancePrompt,
  documentSpecificPrompt
} from '@/prompts/chat/study-coach';

// Import study mode prompts
import {
  studyModeSystemPrompt,
  assessmentContextPrompt,
  topicFocusPrompt,
  studyModeInitialMessage,
  getStudyModeGreetingPrompt
} from '@/prompts/chat/study-mode';
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
  studyMode?: boolean;
  sessionId?: string; // Added sessionId parameter
  selectedDocuments?: string[]; // Selected document filenames
  override_params?: {
    system_prompt?: string;
    temperature?: number;
    [key: string]: any;
  };
}

interface ChatResponse {
  response: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
}

// Create the AI chat
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages, studentId, courseId, preparationPageId, stream = false, studyMode = false, sessionId, selectedDocuments, override_params = {} }: ChatRequest = await req.json();
    
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
    
    // Construct detailed system prompt using imported prompt templates
    // If override_params.system_prompt is provided, use it
    // Otherwise, choose base prompt based on mode
    let systemPrompt = override_params.system_prompt || (studyMode ? studyModeSystemPrompt : studyCoachSystemPrompt);
    
    // If specific documents are selected, add document-specific prompt
    if (selectedDocuments && selectedDocuments.length > 0) {
      // Use the first selected document for the prompt
      const primaryDocument = selectedDocuments[0];
      const documentType = primaryDocument.endsWith('.pdf') ? 'PDF document' : 
                          primaryDocument.endsWith('.pptx') ? 'PowerPoint presentation' : 
                          primaryDocument.endsWith('.docx') ? 'Word document' : 'document';
      systemPrompt += documentSpecificPrompt(primaryDocument, documentType);
    }
    
    if (courseId && courseName) {
      // In study mode, we handle course info differently
      if (!studyMode) {
        systemPrompt += courseSpecificPrompt(courseName, courseId);
      }
      
      // Add context about learning gaps if available
      if (learningGapsData && typeof learningGapsData === 'object' && Object.keys(learningGapsData).length > 0) {
        const gapTopics = Array.isArray((learningGapsData as any).gaps)
          ? (learningGapsData as any).gaps.map((gap: any) => gap.topic)
          : [];
          
        if (gapTopics.length > 0) {
          if (studyMode) {
            // For study mode, focus directly on the gaps
            const primaryGapTopic = gapTopics[0]; // Focus on the main gap topic
            systemPrompt += topicFocusPrompt(primaryGapTopic);
          } else {
            // Regular mode gap handling
            systemPrompt += learningGapsPrompt(gapTopics);
          }
        }
      }
      
      // Add context about preparation page if available
      if (preparationPageId) {
        if (studyMode) {
          // Get assessment type from preparation ID (this is mock logic - real app would query)
          const assessmentType = preparationPageId.includes('quiz') ? 'quiz' : 
                                preparationPageId.includes('exam') ? 'exam' : 'assignment';
          systemPrompt += assessmentContextPrompt(assessmentType);
        } else {
          systemPrompt += preparationPagePrompt(preparationPageId);
        }
      }
    }
    
    // Add guidance for attempt-first approach - only for regular mode, already included in study mode
    if (!studyMode) {
      systemPrompt += attemptFirstGuidancePrompt;
    }
    
    // Set up options for CreateAI API
    const options: any = {
      modelProvider: 'aws',
      modelName: 'claude4_5_sonnet',
      systemPrompt,
      sessionId: sessionId || `student_${studentId || 'unknown'}_course_${courseId || 'unknown'}_${Date.now()}`,
      // Enable search if documents are selected
      enableSearch: selectedDocuments && selectedDocuments.length > 0,
      temperature: override_params.temperature !== undefined ? override_params.temperature : 0.5, // Use override or default
      context,
      stream
    };
    
    // Add search parameters if documents are selected
    if (selectedDocuments && selectedDocuments.length > 0) {
      console.log('Debug - Selected documents in chat route:', selectedDocuments);
      options.searchParams = {
        collection: process.env.CREATE_AI_PROJECT_ID || 'your_project_id_here',
        sourceNames: selectedDocuments,
        topK: 5,
        retrievalType: 'chunk'
      };
    }
    
    // Add any additional override params
    for (const key in override_params) {
      if (key !== 'system_prompt' && key !== 'temperature') {
        options[key] = override_params[key];
      }
    }
    
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
          enableSearch: options.enableSearch,
          searchParams: options.searchParams
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
      
      // Check if this is a request for a study mode greeting
      const isStudyModeGreeting = studyMode && 
                                messages.length === 1 && 
                                lastMessage.content.toLowerCase().includes('study mode');
      
      // If this is a request for a study mode greeting, adjust the content
      const userContent = isStudyModeGreeting ? 
        getStudyModeGreetingPrompt(courseId ? courseName || courseId : 'your course') : 
        lastMessage.content;
      
      // Log the options being sent to CreateAI
      console.log('=== Chat API to CreateAI ===');
      console.log('User content:', userContent);
      console.log('Options being sent:', JSON.stringify(options, null, 2));
      console.log('============================');
      
      // Use direct query API which works with our token
      const queryResponse = await queryCreateAI<{ response: string }>(userContent, options);
      
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