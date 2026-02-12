import { getChatSession, getChatMessages, getStudentChatSessions, dbMessagesToClientFormat } from './chat-db';
import { ChatMessage, SessionHistory } from '@/types';

/**
 * Converts a database session into a SessionHistory object
 */
export function dbSessionToSessionHistory(
  sessionId: string,
  studentId: string,
  courseId: string,
  courseName: string,
  studyMode: boolean,
  createdAt: Date,
  updatedAt: Date,
  messages: ChatMessage[]
): SessionHistory {
  // Calculate session duration in minutes
  const duration = messages.length > 1 ? 
    Math.ceil((updatedAt.getTime() - createdAt.getTime()) / (1000 * 60)) : 0;
  
  // Create a title based on the first user message or use default
  const firstUserMessage = messages.find(msg => msg.role === 'user');
  let title = 'Chat Session';
  
  if (firstUserMessage) {
    // Truncate the message if it's too long
    title = firstUserMessage.content.length > 30 ? 
      `${firstUserMessage.content.substring(0, 30)}...` : 
      firstUserMessage.content;
  }
  
  return {
    id: sessionId,
    courseId: courseId,
    courseName: courseName,
    title: title,
    date: updatedAt,
    type: studyMode ? 'study' : 'practice',
    duration: duration,
    materials: [] // No materials attached yet
  };
}

/**
 * Gets session history for a student's course
 */
export async function getSessionHistory(
  studentId: string,
  courseId: string
): Promise<SessionHistory[]> {
  try {
    // Get all sessions for this student and course
    const sessions = await getStudentChatSessions(studentId);
    const courseSessions = sessions.filter(session => session.course_id === courseId);
    
    if (courseSessions.length === 0) {
      return [];
    }
    
    // Build session history objects
    const sessionHistory: SessionHistory[] = [];
    
    for (const session of courseSessions) {
      try {
        // Get all messages for this session
        const dbMessages = await getChatMessages(session.session_id);
        const messages = dbMessagesToClientFormat(dbMessages);
        
        // Get course name (should come from a course service in a real app)
        const courseName = getCourseNameFromId(courseId);
        
        // Build session history object
        const historyItem = dbSessionToSessionHistory(
          session.session_id,
          studentId,
          courseId,
          courseName,
          session.study_mode,
          session.created_at,
          session.updated_at,
          messages
        );
        
        sessionHistory.push(historyItem);
      } catch (error) {
        console.error(`Error processing session ${session.session_id}:`, error);
        // Skip this session and continue
      }
    }
    
    return sessionHistory.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error('Error getting session history:', error);
    return [];
  }
}

/**
 * Loads messages for a specific chat session
 */
export async function loadChatSession(sessionId: string): Promise<{
  session: SessionHistory | null,
  messages: ChatMessage[]
}> {
  try {
    // Get session details
    const session = await getChatSession(sessionId);
    if (!session) {
      return { session: null, messages: [] };
    }
    
    // Get messages
    const dbMessages = await getChatMessages(sessionId);
    const messages = dbMessagesToClientFormat(dbMessages);
    
    // Get course name
    const courseName = getCourseNameFromId(session.course_id || '');
    
    // Create session history object
    const sessionHistory = dbSessionToSessionHistory(
      session.session_id,
      session.student_id || '',
      session.course_id || '',
      courseName,
      session.study_mode,
      session.created_at,
      session.updated_at,
      messages
    );
    
    return {
      session: sessionHistory,
      messages: messages
    };
  } catch (error) {
    console.error('Error loading chat session:', error);
    return { session: null, messages: [] };
  }
}

// Mock function to get course name - in real app would fetch from course service
function getCourseNameFromId(courseId: string): string {
  const courseMap: Record<string, string> = {
    '1': 'Introduction to Computer Science',
    '2': 'Calculus I',
    '3': 'English Composition',
    '4': 'General Chemistry',
    '5': 'Introduction to Psychology'
  };
  
  return courseMap[courseId] || `Course ${courseId}`;
}