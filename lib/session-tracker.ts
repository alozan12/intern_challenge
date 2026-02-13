/**
 * Service to track the last accessed preparation session
 */

export interface SessionInfo {
  id: string;
  courseId?: string;
  deadlineId?: string;
  title: string;
  timestamp: number;
  isCustom: boolean;
  path: string;
}

const SESSION_STORAGE_KEY = 'asu_study_coach_last_session';

/**
 * Stores information about the last accessed preparation session
 */
export const SessionTracker = {
  /**
   * Track a newly accessed session
   */
  trackSession: (session: Omit<SessionInfo, 'timestamp'>) => {
    if (typeof window === 'undefined') return;
    
    try {
      const sessionInfo: SessionInfo = {
        ...session,
        timestamp: Date.now()
      };
      
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionInfo));
    } catch (error) {
      console.error('Failed to store session info:', error);
    }
  },
  
  /**
   * Get the most recent session information
   */
  getLastSession: (): SessionInfo | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const storedData = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!storedData) return null;
      
      return JSON.parse(storedData) as SessionInfo;
    } catch (error) {
      console.error('Failed to retrieve session info:', error);
      return null;
    }
  },
  
  /**
   * Clear the stored session information
   */
  clearSession: () => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear session info:', error);
    }
  }
};