import { NextRequest, NextResponse } from 'next/server';
import { 
  createChatSession, 
  updateChatSession, 
  getChatSession,
  getStudentChatSessions,
  getSessionsByDeadline,
  saveChatMessage, 
  getChatMessages,
  dbMessagesToClientFormat,
  deleteChatSession
} from '@/lib/chat-db';

// Mock data for development (keeping for reference)
const mockSessions = [
  {
    id: 1,
    session_id: 'study_session_1676540800000',
    student_id: '987655',
    course_id: '1',
    preparation_page_id: 'prep_1',
    study_mode: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
    ended_at: null
  },
  {
    id: 2,
    session_id: 'study_session_1676800800000',
    student_id: '987655',
    course_id: '1',
    preparation_page_id: 'prep_2',
    study_mode: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    ended_at: null
  },
  {
    id: 3,
    session_id: 'study_session_1676900800000',
    student_id: '987655',
    course_id: '2',
    preparation_page_id: 'prep_3',
    study_mode: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    ended_at: null
  }
];

const mockMessages = {
  'study_session_1676540800000': [
    {
      id: '101',
      role: 'assistant',
      content: 'Hello! I\'m your AI Study Coach. How can I help you prepare for your assignment?',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '102',
      role: 'user',
      content: 'Can you help me understand binary search trees?',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000)
    },
    {
      id: '103',
      role: 'assistant',
      content: 'Of course! Binary search trees (BSTs) are data structures with the following properties:\n\n1. Each node has at most two children (left and right)\n2. Left child values are less than the parent node\n3. Right child values are greater than the parent node\n\nThis organization makes searching efficient with O(log n) time complexity in the average case.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 1000)
    }
  ],
  'study_session_1676800800000': [
    {
      id: '201',
      role: 'assistant',
      content: 'Hello! I\'m your AI Study Coach. How can I help you today?',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: '202',
      role: 'user',
      content: 'I need to review for my midterm. Can you help me?',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000)
    },
    {
      id: '203',
      role: 'assistant',
      content: 'I\'d be happy to help you review for your midterm. Let\'s start by identifying the key topics covered in your course so far. Could you list the main concepts you need to study?',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 6 * 60 * 1000)
    }
  ],
  'study_session_1676900800000': [
    {
      id: '301',
      role: 'assistant',
      content: 'Hello! I\'m your AI Study Coach for Calculus I. How can I assist you today?',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '302',
      role: 'user',
      content: 'I need to practice derivatives',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000)
    },
    {
      id: '303',
      role: 'assistant',
      content: 'Great! Let\'s practice derivatives. I\'ll give you some problems to work through. First, can you tell me which derivative rules you\'d like to focus on? (Power rule, product rule, quotient rule, chain rule, etc.)',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 11 * 60 * 1000)
    }
  ]
};

// Get all sessions for a student and course
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get('studentId');
    const courseId = url.searchParams.get('courseId');
    const deadlineId = url.searchParams.get('deadlineId');
    const sessionId = url.searchParams.get('sessionId');
    
    console.log('API Request:', { studentId, courseId, sessionId });
    
    if (sessionId) {
      // Get specific session with messages
      const session = await getChatSession(sessionId);
      
      if (!session) {
        console.log('Session not found:', sessionId);
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      
      const messages = await getChatMessages(sessionId);
      const clientMessages = dbMessagesToClientFormat(messages);
      
      console.log('Returning session and messages:', { 
        sessionId, 
        messageCount: clientMessages.length 
      });
      
      return NextResponse.json({
        session,
        messages: clientMessages
      });
    }
    
    if (!studentId || !courseId) {
      console.log('Missing required params');
      return NextResponse.json(
        { error: 'studentId and courseId are required' },
        { status: 400 }
      );
    }
    
    // Get sessions from database
    let sessions;
    if (deadlineId) {
      // If deadlineId is provided, get sessions specific to that deadline
      sessions = await getSessionsByDeadline(studentId, courseId, deadlineId);
    } else {
      // Otherwise get all sessions for the student
      sessions = await getStudentChatSessions(studentId);
    }
    
    console.log('Returning sessions:', {
      count: sessions.length,
      studentId,
      courseId
    });
    
    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error('Error in chat sessions API GET:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Failed to get chat sessions', details: error.message },
      { status: 500 }
    );
  }
}

// Create or update a session
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { 
      session_id, 
      student_id, 
      course_id, 
      deadline_id,
      study_mode,
      messages,
      title
    } = data;
    
    console.log('Save session request:', { 
      session_id, 
      student_id, 
      course_id,
      study_mode,
      messageCount: messages?.length
    });
    
    if (!session_id || !student_id) {
      return NextResponse.json(
        { error: 'session_id and student_id are required' },
        { status: 400 }
      );
    }
    
    // Check if session exists
    const existingSession = await getChatSession(session_id);
    
    let session;
    if (existingSession) {
      // Update existing session - use provided title if it's the first user message
      const updatedTitle = title || existingSession.title;
      session = await updateChatSession(session_id, { 
        updated_at: new Date(),
        title: updatedTitle
      });
    } else {
      // Create new session - use provided title or default
      const sessionTitle = title || `${study_mode ? 'Study Mode: ' : ''}Chat Session ${new Date().toLocaleDateString()}`;
      session = await createChatSession(
        session_id,
        student_id,
        sessionTitle,
        course_id,
        deadline_id
      );
    }
    
    // Save messages if provided
    if (messages && messages.length > 0) {
      // Get existing messages to avoid duplicates
      const existingMessages = await getChatMessages(session_id);
      const existingCount = existingMessages.length;
      
      // Only save new messages (those beyond what's already in the database)
      const newMessages = messages.slice(existingCount);
      
      console.log(`Session ${session_id}: ${existingCount} existing messages, ${newMessages.length} new messages to save`);
      
      // Save only the new messages
      for (let i = 0; i < newMessages.length; i++) {
        const msg = newMessages[i];
        await saveChatMessage(
          session_id,
          msg.role,
          msg.content,
          existingCount + i + 1 // Ensure correct sequence
        );
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      session
    });
  } catch (error: any) {
    console.error('Error in chat sessions API POST:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Failed to save chat session', details: error.message },
      { status: 500 }
    );
  }
}

// Delete a session
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }
    
    console.log('Deleting session:', sessionId);
    
    const success = await deleteChatSession(sessionId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error: any) {
    console.error('Error in chat sessions API DELETE:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat session', details: error.message },
      { status: 500 }
    );
  }
}