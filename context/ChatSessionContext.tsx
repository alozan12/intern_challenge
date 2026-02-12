'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { ChatMessage, SessionHistory } from '@/types'
import { loadChatSession } from '@/lib/chat-sessions-client'

type ChatSessionContextType = {
  activeSessionId: string | null
  messages: ChatMessage[]
  isStudyMode: boolean
  loadingSession: boolean
  activeSession: SessionHistory | null
  loadSession: (sessionId: string) => Promise<boolean>
  setMessages: (messages: ChatMessage[]) => void
  setIsStudyMode: (mode: boolean) => void
  createNewSession: (sessionId: string, initialMessage: ChatMessage) => void
}

const ChatSessionContext = createContext<ChatSessionContextType>({
  activeSessionId: null,
  messages: [],
  isStudyMode: false,
  loadingSession: false,
  activeSession: null,
  loadSession: async () => false,
  setMessages: () => {},
  setIsStudyMode: () => {},
  createNewSession: () => {}
})

export const useChatSession = () => useContext(ChatSessionContext)

export function ChatSessionProvider({ children }: { children: ReactNode }) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStudyMode, setIsStudyMode] = useState(false)
  const [loadingSession, setLoadingSession] = useState(false)
  const [activeSession, setActiveSession] = useState<SessionHistory | null>(null)

  // Function to load a session from the database
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      setLoadingSession(true)
      console.log('Loading session:', sessionId)
      
      const { session, messages: sessionMessages } = await loadChatSession(sessionId)
      
      if (!session) {
        console.error('Session not found:', sessionId)
        return false
      }
      
      setActiveSessionId(sessionId)
      setMessages(sessionMessages)
      setIsStudyMode(session.type === 'study')
      setActiveSession(session)
      return true
    } catch (error) {
      console.error('Failed to load session:', error)
      return false
    } finally {
      setLoadingSession(false)
    }
  }, [])

  // Function to create a new session
  const createNewSession = useCallback((sessionId: string, initialMessage: ChatMessage) => {
    // Clear existing state
    setActiveSessionId(sessionId)
    setMessages([initialMessage])
    setIsStudyMode(false)
    setActiveSession(null)
    
    // Dispatch event to trigger session list refresh
    setTimeout(() => {
      console.log('Dispatching refresh-sessions event from context')
      window.dispatchEvent(new CustomEvent('refresh-sessions'))
    }, 300)
  }, [])

  const value = {
    activeSessionId,
    messages,
    isStudyMode,
    loadingSession,
    activeSession,
    loadSession,
    setMessages,
    setIsStudyMode,
    createNewSession
  }

  return (
    <ChatSessionContext.Provider value={value}>
      {children}
    </ChatSessionContext.Provider>
  )
}