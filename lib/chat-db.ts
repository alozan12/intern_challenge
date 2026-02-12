import { query } from '@/lib/db';
import { ChatMessage } from '@/types';

// Interface for chat sessions stored in database
export interface DbChatSession {
  session_id: string;
  user_id: string; // bigint is stored as string in PostgreSQL node driver
  title: string | null;
  course_id: string | null;
  deadline_id: string | null;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

// Interface for chat messages stored in database
export interface DbChatMessage {
  message_id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  message_sequence: number;
  created_at: Date;
}

/**
 * Creates a new chat session in the database
 */
export async function createChatSession(
  session_id: string,
  user_id: string | null,
  title?: string | null,
  course_id?: string | null,
  deadline_id?: string | null
): Promise<DbChatSession> {
  try {
    const result = await query(
      `INSERT INTO chat_sessions 
        (session_id, user_id, title, course_id, deadline_id, created_at, updated_at, is_deleted) 
      VALUES 
        ($1, $2, $3, $4, $5, NOW(), NOW(), false)
      RETURNING *`,
      [session_id, user_id, title || `Chat Session ${new Date().toLocaleDateString()}`, course_id, deadline_id]
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to create chat session');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
}

/**
 * Updates an existing chat session
 */
export async function updateChatSession(
  session_id: string,
  updates: Partial<{
    title: string;
    is_deleted: boolean;
    updated_at: Date;
  }>
): Promise<DbChatSession | null> {
  try {
    // Build the update query dynamically based on which fields are provided
    const setValues: string[] = [];
    const queryParams: any[] = [session_id];
    let paramCounter = 2;

    // Add each provided update field to the query
    if (updates.title !== undefined) {
      setValues.push(`title = $${paramCounter++}`);
      queryParams.push(updates.title);
    }

    if (updates.is_deleted !== undefined) {
      setValues.push(`is_deleted = $${paramCounter++}`);
      queryParams.push(updates.is_deleted);
    }

    if (updates.updated_at !== undefined) {
      setValues.push(`updated_at = $${paramCounter++}`);
      queryParams.push(updates.updated_at);
    } else {
      // Always update the updated_at timestamp if not provided
      setValues.push(`updated_at = NOW()`);
    }

    // If no fields to update, just update timestamp
    if (setValues.length === 0) {
      setValues.push(`updated_at = NOW()`);
    }

    const result = await query(
      `UPDATE chat_sessions 
      SET ${setValues.join(', ')} 
      WHERE session_id = $1 
      RETURNING *`,
      queryParams
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error updating chat session:', error);
    throw error;
  }
}

/**
 * Gets a chat session by session_id
 */
export async function getChatSession(session_id: string): Promise<DbChatSession | null> {
  try {
    const result = await query(
      'SELECT * FROM chat_sessions WHERE session_id = $1',
      [session_id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error getting chat session:', error);
    throw error;
  }
}

/**
 * Gets all chat sessions for a student
 */
export async function getStudentChatSessions(user_id: string): Promise<DbChatSession[]> {
  try {
    const result = await query(
      'SELECT * FROM chat_sessions WHERE user_id = $1 AND (is_deleted = false OR is_deleted IS NULL) ORDER BY updated_at DESC',
      [user_id]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting student chat sessions:', error);
    throw error;
  }
}

/**
 * Gets chat sessions for a student filtered by course and deadline
 */
export async function getSessionsByDeadline(
  user_id: string, 
  course_id: string, 
  deadline_id: string
): Promise<DbChatSession[]> {
  try {
    const result = await query(
      `SELECT * FROM chat_sessions 
       WHERE user_id = $1 
       AND course_id = $2 
       AND deadline_id = $3 
       AND (is_deleted = false OR is_deleted IS NULL) 
       ORDER BY updated_at DESC`,
      [user_id, course_id, deadline_id]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting deadline-specific chat sessions:', error);
    throw error;
  }
}

// Note: The database doesn't have course_id in chat_sessions table
// Sessions are associated with users, not courses

/**
 * Deletes a chat session (soft delete by setting is_deleted flag)
 */
export async function deleteChatSession(session_id: string): Promise<boolean> {
  try {
    const result = await query(
      'UPDATE chat_sessions SET is_deleted = true, updated_at = NOW() WHERE session_id = $1 RETURNING *',
      [session_id]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting chat session:', error);
    throw error;
  }
}

/**
 * Saves a chat message to the database
 */
export async function saveChatMessage(
  session_id: string,
  role: 'user' | 'assistant',
  content: string,
  message_sequence?: number
): Promise<DbChatMessage> {
  try {
    // Get the next message sequence if not provided
    let sequence = message_sequence;
    if (sequence === undefined) {
      const maxSeqResult = await query(
        'SELECT COALESCE(MAX(message_sequence), 0) + 1 as next_seq FROM chat_messages WHERE session_id = $1',
        [session_id]
      );
      sequence = maxSeqResult.rows[0].next_seq;
    }
    
    const result = await query(
      `INSERT INTO chat_messages 
        (message_id, session_id, role, content, message_sequence, created_at) 
      VALUES 
        (gen_random_uuid(), $1, $2, $3, $4, NOW())
      RETURNING *`,
      [session_id, role, content, sequence]
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to save chat message');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
}

/**
 * Gets all messages for a chat session
 */
export async function getChatMessages(session_id: string): Promise<DbChatMessage[]> {
  try {
    const result = await query(
      'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY message_sequence ASC',
      [session_id]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw error;
  }
}

/**
 * Converts database messages to frontend ChatMessage format
 */
export function dbMessagesToClientFormat(dbMessages: DbChatMessage[]): ChatMessage[] {
  return dbMessages.map(dbMsg => ({
    id: dbMsg.message_id,
    role: dbMsg.role,
    content: dbMsg.content,
    timestamp: dbMsg.created_at
  }));
}

/**
 * Creates or updates a chat session and saves a batch of messages
 */
export async function saveChatSessionWithMessages(
  session_id: string,
  user_id: string | null,
  course_id: string | null,
  deadline_id: string | null,
  study_mode: boolean,
  messages: ChatMessage[],
  title?: string
): Promise<boolean> {
  try {
    // First, check if session exists
    const existingSession = await getChatSession(session_id);
    
    if (!existingSession) {
      // Create new session if it doesn't exist
      const sessionTitle = title || `${study_mode ? 'Study Mode: ' : ''}Chat Session ${new Date().toLocaleDateString()}`;
      await createChatSession(session_id, user_id, sessionTitle, course_id, deadline_id);
    } else {
      // Update existing session - update title if provided
      const updates: any = { updated_at: new Date() };
      if (title && !existingSession.title?.includes('...')) {
        // Only update title if it's provided and the existing title doesn't already have user content
        updates.title = title;
      }
      await updateChatSession(session_id, updates);
    }
    
    // Get existing messages to avoid duplicates
    const existingMessages = await getChatMessages(session_id);
    const existingCount = existingMessages.length;
    
    console.log(`Session ${session_id}: ${existingCount} existing messages, ${messages.length} total messages to save`);
    
    // Only save NEW messages (those beyond what's already in the database)
    // This assumes messages are always appended in order
    if (messages.length > existingCount) {
      let sequence = existingCount;
      // Only process messages that are new (beyond existing count)
      const newMessages = messages.slice(existingCount);
      
      console.log(`Saving ${newMessages.length} new messages`);
      
      for (const message of newMessages) {
        await saveChatMessage(
          session_id,
          message.role,
          message.content,
          ++sequence
        );
      }
    } else {
      console.log('No new messages to save');
    }
    
    return true;
  } catch (error) {
    console.error('Error saving chat session with messages:', error);
    throw error;
  }
}