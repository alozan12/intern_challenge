'use client';

import { useState, useEffect } from 'react';
import { SessionTracker, SessionInfo } from '@/lib/session-tracker';

/**
 * Hook to access and manage the last preparation session
 */
export function useLastSession() {
  const [lastSession, setLastSession] = useState<SessionInfo | null>(null);
  
  // Load the last session when the component mounts
  useEffect(() => {
    const session = SessionTracker.getLastSession();
    setLastSession(session);
  }, []);
  
  // Track a new session
  const trackSession = (session: Omit<SessionInfo, 'timestamp'>) => {
    SessionTracker.trackSession(session);
    
    // Update the state with the new session info including timestamp
    setLastSession({
      ...session,
      timestamp: Date.now()
    });
  };
  
  // Clear the last session
  const clearSession = () => {
    SessionTracker.clearSession();
    setLastSession(null);
  };
  
  // Helper to determine if a session exists and is recent (within last 30 days)
  const hasRecentSession = () => {
    if (!lastSession) return false;
    
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    return Date.now() - lastSession.timestamp < thirtyDaysMs;
  };
  
  return {
    lastSession,
    trackSession,
    clearSession,
    hasRecentSession
  };
}