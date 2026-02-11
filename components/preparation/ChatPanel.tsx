'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic, BookOpen, Plus, X } from 'lucide-react'
import { ChatMessage } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useViewMode } from '@/context/ViewModeContext'

interface ChatPanelProps {
  courseId: string
  deadlineId: string
}

// Mock course data - in real app would come from API
const getCourseInfo = (courseId: string) => {
  const courses: Record<string, { name: string, code: string }> = {
    '1': { name: 'Introduction to Computer Science', code: 'CSE 110' },
    '2': { name: 'Calculus I', code: 'MAT 265' },
    '3': { name: 'English Composition', code: 'ENG 101' },
    '4': { name: 'General Chemistry', code: 'CHM 113' },
    '5': { name: 'Introduction to Psychology', code: 'PSY 101' }
  }
  return courses[courseId] || { name: 'Course', code: 'COURSE' }
}

export function ChatPanel({ courseId, deadlineId }: ChatPanelProps) {
  const courseInfo = getCourseInfo(courseId)
  const { viewMode } = useViewMode()
  const [isStudyMode, setIsStudyMode] = useState(false)
  const [showModeNotification, setShowModeNotification] = useState(false)
  const [notificationType, setNotificationType] = useState<'enter' | 'exit' | null>(null)
  const [showModeToggle, setShowModeToggle] = useState(false)
  
  // Initialize messages with course-specific content
  const createInitialMessage = () => ({
    id: Date.now().toString(),
    role: 'assistant' as const,
    content: `Hello! I'm your AI Study Coach for ${courseInfo.code}. I'm here to help you prepare for your upcoming assignment. What specific topics would you like to review?`,
    timestamp: new Date()
  })
  
  const initialMessages: ChatMessage[] = [createInitialMessage()]
  
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [pastSessions, setPastSessions] = useState<ChatMessage[][]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const modeToggleRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle clicking outside of the mode toggle dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modeToggleRef.current && !modeToggleRef.current.contains(event.target as Node)) {
        setShowModeToggle(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call our API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({ role: msg.role, content: msg.content })),
          studentId: '987654', // Example student ID
          courseId: courseId,
          stream: false,
          // Include study mode flag - updated dynamically from state
          studyMode: isStudyMode,
          // Added for error handling
          fallbackToMock: true
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from AI')
      }

      const data = await response.json()
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      
      // Fallback response if API fails
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting to my knowledge base right now. Please try again in a moment.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn("flex flex-col h-full", viewMode === 'compact' ? 'text-sm' : '')}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <h2 className={cn("font-semibold text-gray-900", viewMode === 'compact' ? 'text-base' : 'text-lg')}>
                {isStudyMode ? (
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" /> Study Mode
                  </span>
                ) : (
                  'AI Study Coach'
                )}
              </h2>
              <p className={cn("text-gray-600", viewMode === 'compact' ? 'text-xs' : 'text-sm')}>
                {isStudyMode 
                  ? 'Interactive guided learning with practice questions' 
                  : 'Ask questions about your course content'}
              </p>
            </div>
            {isStudyMode && (
              <div className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-md">
                Active
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* New session button */}
            <button 
              onClick={async () => {
              console.log('Starting new session');
              // Only save session if it has user messages
              if (messages.length > 1) {
                console.log('Saving old session', messages);
                // Save current session to history
                setPastSessions(prev => [...prev, [...messages]]);
              }
              
              // Exit study mode if active
              if (isStudyMode) {
                setIsStudyMode(false);
              }
              
              setIsLoading(true);
              
              try {
                // Get a personalized greeting from the API
                const response = await fetch('/api/chat', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    messages: [{
                      role: 'user',
                      content: `Please provide a greeting as an AI Study Coach for ${courseInfo.code} course. Introduce yourself and ask how you can help.`
                    }],
                    studentId: '987654', // Example student ID
                    courseId: courseId
                  }),
                });
                
                if (response.ok) {
                  const data = await response.json();
                  const newInitialMessage = {
                    id: Date.now().toString(),
                    role: 'assistant' as const,
                    content: data.response,
                    timestamp: new Date()
                  };
                  setMessages([newInitialMessage]);
                } else {
                  // Fallback to default greeting if API call fails
                  const newInitialMessage = createInitialMessage();
                  setMessages([newInitialMessage]);
                }
              } catch (error) {
                console.error('Error getting initial greeting:', error);
                const newInitialMessage = createInitialMessage();
                setMessages([newInitialMessage]);
              } finally {
                setIsLoading(false);
              }
            }}
              className={cn(
                "text-white rounded-md hover:bg-red-900 transition-colors flex items-center gap-1 bg-asu-maroon",
                viewMode === 'compact' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
              )}
            >
              Start New Session
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className={cn("space-y-4", viewMode === 'compact' ? 'space-y-2' : '')}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg",
                  viewMode === 'compact' ? 'px-3 py-2' : 'px-4 py-3',
                  message.role === 'user'
                    ? "bg-asu-maroon text-white"
                    : "bg-gray-100 text-gray-900"
                )}
              >
                <p className={cn("whitespace-pre-wrap", viewMode === 'compact' ? 'text-xs' : 'text-sm')}>{message.content}</p>
                <p className={cn(
                  viewMode === 'compact' ? 'text-[10px] mt-0.5' : 'text-xs mt-1',
                  message.role === 'user' ? "text-red-200" : "text-gray-500"
                )}>
                  <span suppressHydrationWarning>
                    {format(message.timestamp, 'h:mm a')}
                  </span>
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          
          {/* Mode change notification */}
          {showModeNotification && (
            <div className="flex justify-center">
              <div className={cn(
                "px-4 py-2 rounded-full text-sm transition-opacity duration-300 flex items-center gap-2",
                notificationType === 'enter' ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
              )}>
                {notificationType === 'enter' ? (
                  <>
                    <BookOpen className="w-4 h-4" /> 
                    Study Mode activated
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" /> 
                    Study Mode deactivated
                  </>
                )}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="relative">
          <div className="flex items-center h-10 bg-white rounded-lg border border-gray-300 overflow-hidden focus-within:border-asu-maroon focus-within:ring-1 focus-within:ring-asu-maroon transition-colors">
            {/* Plus button with dropdown */}
            <div className="pl-3 flex items-center justify-start w-10" ref={modeToggleRef}>
              <button
                onClick={() => setShowModeToggle(prev => !prev)}
                className={cn(
                  "flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors",
                  isStudyMode && "text-green-600"
                )}
              >
                <Plus className="w-5 h-5" />
              </button>
              
              {showModeToggle && (
                <div className="absolute bottom-full mb-2 left-0 w-56 rounded-md shadow-lg bg-white border border-gray-200 z-10">
                  <div className="p-1 space-y-0.5">
                    {/* Study Mode option */}
                    <button
                      onClick={() => {
                        setShowModeToggle(false);
                        // Show notification and set type based on current mode state
                        setNotificationType(isStudyMode ? 'exit' : 'enter');
                        setShowModeNotification(true);
                        // Hide notification after 3 seconds
                        setTimeout(() => {
                          setShowModeNotification(false);
                        }, 3000);
                        // Toggle study mode
                        setIsStudyMode(!isStudyMode);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2",
                        "hover:bg-gray-100",
                        "text-gray-700"
                      )}
                    >
                      <BookOpen className="w-4 h-4" />
                      {isStudyMode ? "Exit Study Mode" : "Start Study Mode"}
                    </button>
                    
                    <div className="border-t border-gray-200 mt-1 mb-2 pt-2">
                      <p className="px-3 text-xs text-gray-500">Attach File</p>
                    </div>
                    
                    {/* Document upload */}
                    <button
                      onClick={() => {
                        setShowModeToggle(false);
                        // This would open a file picker in a real implementation
                        console.log('Upload document');
                        // For now just add a mock message
                        const userMessage: ChatMessage = {
                          id: Date.now().toString(),
                          role: 'user',
                          content: '[Document uploaded: lecture_notes.pdf]',
                          timestamp: new Date()
                        };
                        setMessages(prev => [...prev, userMessage]);
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 hover:bg-gray-100 text-gray-700"
                    >
                      <Paperclip className="w-4 h-4" />
                      Document
                    </button>
                    
                    {/* Image upload */}
                    <button
                      onClick={() => {
                        setShowModeToggle(false);
                        // This would open a file picker in a real implementation
                        console.log('Upload image');
                        // For now just add a mock message
                        const userMessage: ChatMessage = {
                          id: Date.now().toString(),
                          role: 'user',
                          content: '[Image uploaded: diagram.png]',
                          timestamp: new Date()
                        };
                        setMessages(prev => [...prev, userMessage]);
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 hover:bg-gray-100 text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                      Image
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input field */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isStudyMode ? "Enter your understanding of the topic..." : "Ask anything..."}
              className="flex-1 border-none outline-none py-2 px-3 resize-none focus:ring-0"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            
            {/* Send button */}
            <div className="pr-3 flex items-center justify-end w-10">
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "flex items-center justify-center transition-colors",
                  input.trim() && !isLoading
                    ? "text-asu-maroon hover:text-red-900"
                    : "text-gray-300 cursor-not-allowed"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Attachment text */}
          <p className="text-xs text-gray-500 mt-2">
            Attach or Drop Files Here
          </p>
        </div>
      </div>
    </div>
  )
}