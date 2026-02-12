import { ChatMessage } from '@/types';

/**
 * Converts database messages to frontend ChatMessage format
 * This function is used by both server and client
 */
export function dbMessagesToClientFormat(dbMessages: any[]): ChatMessage[] {
  return dbMessages.map(dbMsg => ({
    id: dbMsg.id.toString(),
    role: dbMsg.role,
    content: dbMsg.content,
    timestamp: new Date(dbMsg.timestamp)
  }));
}