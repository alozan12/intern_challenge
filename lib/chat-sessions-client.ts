'use client'

import { ChatMessage, SessionHistory } from '@/types';

/**
 * Client-side version of chat sessions API
 * This avoids using Node.js modules like 'dns' that are required by 'pg'
 */

/**
 * Gets session history for a student's course
 */
export async function getSessionHistory(
  studentId: string,
  courseId: string
): Promise<SessionHistory[]> {
  try {
    const response = await fetch(`/api/chat-sessions?studentId=${encodeURIComponent(studentId)}&courseId=${encodeURIComponent(courseId)}`);
    
    if (!response.ok) {
      console.error('Failed to get session history:', response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.sessions || !Array.isArray(data.sessions)) {
      return [];
    }
    
    // Convert database sessions to SessionHistory format
    return data.sessions.map(session => ({
      id: session.session_id,
      courseId: courseId, // Use the courseId from the request since DB doesn't store it
      courseName: getCourseNameFromId(courseId),
      title: session.title || `Chat Session ${new Date(session.created_at).toLocaleString()}`,
      date: new Date(session.updated_at),
      type: session.title?.includes('Study Mode') ? 'study' : 'practice',
      duration: calculateSessionDuration(session.created_at, session.updated_at),
      materials: []
    })).sort((a, b) => b.date.getTime() - a.date.getTime());
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
    const response = await fetch(`/api/chat-sessions?sessionId=${encodeURIComponent(sessionId)}`);
    
    if (!response.ok) {
      console.error('Failed to load chat session:', response.status, response.statusText);
      return { session: null, messages: [] };
    }
    
    const data = await response.json();
    
    if (!data.session) {
      return { session: null, messages: [] };
    }
    
    // Create session history object
    const sessionHistory: SessionHistory = {
      id: data.session.session_id,
      courseId: '1', // Default to course 1 since DB doesn't store course info
      courseName: getCourseNameFromId('1'),
      title: data.session.title || `Chat Session ${new Date(data.session.created_at).toLocaleString()}`,
      date: new Date(data.session.updated_at),
      type: data.session.title?.includes('Study Mode') ? 'study' : 'practice',
      duration: calculateSessionDuration(data.session.created_at, data.session.updated_at),
      materials: []
    };
    
    return {
      session: sessionHistory,
      messages: data.messages || []
    };
  } catch (error) {
    console.error('Error loading chat session:', error);
    return { session: null, messages: [] };
  }
}

/**
 * Saves a chat session with messages to the database
 */
export async function saveChatSessionWithMessages(
  sessionId: string,
  studentId: string,
  courseId: string,
  preparationId: string,
  studyMode: boolean,
  messages: ChatMessage[],
  title?: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/chat-sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_id: sessionId,
        student_id: studentId,
        course_id: courseId,
        preparation_page_id: preparationId,
        study_mode: studyMode,
        messages: messages,
        title: title
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save session: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Error saving chat session with messages:', error);
    return false;
  }
}

// Helper function to calculate session duration in minutes
function calculateSessionDuration(createdAt: string, updatedAt: string): number {
  const start = new Date(createdAt).getTime();
  const end = new Date(updatedAt).getTime();
  return Math.ceil((end - start) / (1000 * 60));
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

/**
 * Deletes a chat session
 */
export async function deleteChatSession(sessionId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/chat-sessions?sessionId=${encodeURIComponent(sessionId)}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      console.error('Failed to delete chat session:', response.status, response.statusText);
      return false;
    }
    
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return false;
  }
}