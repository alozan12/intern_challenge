'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic } from 'lucide-react'
import { ChatMessage } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

    // Simulate AI response - replace with actual API call
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I understand you want to learn about that topic. Let me help you understand the key concepts...',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Study Coach</h2>
            <p className="text-sm text-gray-600">Ask questions about your course content</p>
          </div>
          <button 
            onClick={() => {
              console.log('Starting new session');
              // Only save session if it has user messages
              if (messages.length > 1) {
                console.log('Saving old session', messages);
                // Save current session to history
                setPastSessions(prev => [...prev, [...messages]]);
              }
              
              // Start a new session with initial AI greeting
              const newInitialMessage = createInitialMessage();
              console.log('New initial message', newInitialMessage);
              setMessages([newInitialMessage]);
            }}
            className="px-3 py-1.5 text-sm bg-asu-maroon text-white rounded-md hover:bg-red-900 transition-colors flex items-center gap-1"
          >
            Start New Session
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
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
                  "max-w-[80%] rounded-lg px-4 py-3",
                  message.role === 'user'
                    ? "bg-asu-maroon text-white"
                    : "bg-gray-100 text-gray-900"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={cn(
                  "text-xs mt-1",
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
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex items-end gap-3">
          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-asu-maroon focus:outline-none focus:ring-1 focus:ring-asu-maroon transition-colors"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button className="absolute right-2 bottom-2 p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <Mic className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-3 rounded-lg transition-colors",
              input.trim() && !isLoading
                ? "bg-asu-maroon text-white hover:bg-red-900"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Attach or Drop Files Here
        </p>
      </div>
    </div>
  )
}