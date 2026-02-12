'use client'

import { useState, useEffect } from 'react'
import { Clock, FileText, Brain, RotateCcw, RefreshCw, Trash2 } from 'lucide-react'
import { SessionHistory } from '@/types'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { getSessionHistory, deleteChatSession } from '@/lib/chat-sessions-client'
import { useChatSession } from '@/context/ChatSessionContext'

interface SessionHistoryTabProps {
  courseId: string
}

// Default student ID - would come from auth in real app
const STUDENT_ID = '987655';

export function SessionHistoryTab({ courseId }: SessionHistoryTabProps) {
  const { activeSessionId, loadSession } = useChatSession()
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(activeSessionId)
  const [courseSessions, setCourseSessions] = useState<SessionHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null)
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  
  // Load session history from database
  useEffect(() => {
    let isInitialLoad = true;
    
    const loadSessionHistory = async (showLoading = true) => {
      if (showLoading && isInitialLoad) {
        setIsLoading(true)
      }
      setError(null)
      
      try {
        const sessions = await getSessionHistory(STUDENT_ID, courseId)
        setCourseSessions(sessions)
      } catch (err) {
        console.error('Failed to load session history:', err)
        setError('Failed to load session history')
        // Fallback to empty array
        setCourseSessions([])
      } finally {
        if (showLoading && isInitialLoad) {
          setIsLoading(false)
          isInitialLoad = false;
        }
      }
    }
    
    loadSessionHistory()
    
    // Set up event listener for session refresh
    const handleRefreshSessions = () => {
      console.log('Refreshing session history from event')
      loadSessionHistory(false) // Don't show loading for event-based refresh
    }
    
    window.addEventListener('refresh-sessions', handleRefreshSessions)
    
    // Set up interval to auto-refresh every 5 seconds (silently)
    const intervalId = setInterval(() => {
      loadSessionHistory(false) // Don't show loading for periodic refresh
    }, 5000)
    
    return () => {
      window.removeEventListener('refresh-sessions', handleRefreshSessions)
      clearInterval(intervalId)
    }
  }, [courseId])
  
  // Function to refresh sessions
  const refreshSessions = async () => {
    setError(null)
    
    try {
      const sessions = await getSessionHistory(STUDENT_ID, courseId)
      setCourseSessions(sessions)
    } catch (err) {
      console.error('Failed to refresh session history:', err)
      setError('Failed to refresh session history')
    }
  }

  // Function to handle session deletion
  const handleDeleteSession = async (sessionId: string) => {
    setDeletingSessionId(sessionId)
    
    try {
      const success = await deleteChatSession(sessionId)
      
      if (success) {
        // Remove the deleted session from the list
        setCourseSessions(prev => prev.filter(session => session.id !== sessionId))
        
        // If we deleted the active session, clear the selection
        if (activeSessionId === sessionId) {
          setSelectedSessionId(null)
        }
      } else {
        console.error('Failed to delete session')
        setError('Failed to delete session')
      }
    } catch (err) {
      console.error('Error deleting session:', err)
      setError('Failed to delete session')
    } finally {
      setDeletingSessionId(null)
      setShowDeleteConfirm(null)
    }
  }

  const getSessionIcon = (type: SessionHistory['type']) => {
    switch(type) {
      case 'study':
        return <FileText className="w-4 h-4" />
      case 'practice':
        return <Brain className="w-4 h-4" />
      case 'review':
        return <RotateCcw className="w-4 h-4" />
    }
  }

  const getSessionColor = (type: SessionHistory['type']) => {
    switch(type) {
      case 'study':
        return 'text-blue-600 bg-blue-50'
      case 'practice':
        return 'text-green-600 bg-green-50'
      case 'review':
        return 'text-purple-600 bg-purple-50'
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-2">
        {courseSessions.map((session) => (
          <div key={session.id} className="relative group">
            {/* Delete confirmation dialog */}
            {showDeleteConfirm === session.id && (
              <div className="absolute inset-0 bg-white bg-opacity-95 rounded-lg z-10 flex items-center justify-center p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 mb-3">Delete this session?</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="px-3 py-1 text-xs rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-3 py-1 text-xs rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={async () => {
                setSelectedSessionId(session.id)
                setLoadingSessionId(session.id)
                try {
                  const success = await loadSession(session.id)
                  if (!success) {
                    console.error('Failed to load session', session.id)
                  }
                } catch (err) {
                  console.error('Error loading session:', err)
                } finally {
                  setLoadingSessionId(null)
                }
              }}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all",
                selectedSessionId === session.id
                  ? "border-asu-maroon bg-red-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                loadingSessionId === session.id && "opacity-70"
              )}
            >
              <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-md",
                getSessionColor(session.type)
              )}>
                {getSessionIcon(session.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="font-medium text-sm text-gray-900 truncate">
                    {session.title}
                  </h4>
                  {loadingSessionId === session.id && (
                    <RefreshCw className="w-3 h-3 animate-spin text-asu-maroon" />
                  )}
                  {activeSessionId === session.id && (
                    <div className="w-2 h-2 rounded-full bg-green-500" title="Active session" />
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span suppressHydrationWarning>{format(session.date, 'MMM d, yyyy')}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{session.duration} min</span>
                  </div>
                </div>
                {session.materials.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    {session.materials.length} study materials created
                  </div>
                )}
              </div>
            </div>
          </button>
          
          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowDeleteConfirm(session.id)
            }}
            className={cn(
              "absolute top-3 right-3 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity",
              "text-gray-500 hover:text-red-600 hover:bg-red-50",
              deletingSessionId === session.id && "opacity-100"
            )}
            disabled={deletingSessionId === session.id}
          >
            {deletingSessionId === session.id ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">
          <RefreshCw className="w-12 h-12 mx-auto mb-3 text-gray-300 animate-spin" />
          <p className="text-sm">Loading sessions...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-gray-500">
          <div className="w-12 h-12 mx-auto mb-3 text-red-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm">{error}</p>
          <button 
            onClick={refreshSessions}
            className="mt-3 px-3 py-1 text-xs rounded-md text-white bg-asu-maroon hover:bg-red-900 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : courseSessions.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No previous study sessions</p>
          <p className="text-xs mt-1">Your sessions will appear here</p>
          <button 
            onClick={refreshSessions}
            className="mt-3 px-3 py-1 text-xs rounded-md text-white bg-asu-maroon hover:bg-red-900 transition-colors"
          >
            Refresh
          </button>
        </div>
      ) : null}
    </div>
  )
}