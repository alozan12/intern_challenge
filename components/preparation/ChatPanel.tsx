'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Paperclip, Mic, BookOpen, Plus, X } from 'lucide-react'
import { saveChatSessionWithMessages } from '@/lib/chat-sessions-client'
import { useChatSession } from '@/context/ChatSessionContext'

// Study mode custom prompt
const studyModeCustomPrompt = `You are now in STUDY MODE. In this mode, your responses should:
1. Guide the student through concepts rather than providing direct answers
2. Ask the student to demonstrate their understanding first
3. Provide scaffolded hints rather than complete solutions
4. Include retrieval practice questions to reinforce learning
5. Be concise and clear in your explanations

The student has explicitly requested study mode, so maintain this approach until instructed otherwise.`
import { ChatMessage } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useViewMode } from '@/context/ViewModeContext'
import { useSelectedMaterials } from '@/context/SelectedMaterialsContext'
import { sendQueryToCreateAI } from '@/lib/createai-api'
import { MarkdownMessage } from '@/components/ui/MarkdownMessage'

interface ChatPanelProps {
  courseId: string
  deadlineId: string
  courseName?: string
  deadlineTitle?: string
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

export function ChatPanel({ courseId, deadlineId, courseName, deadlineTitle }: ChatPanelProps) {
  // Use provided course info or fall back to mock data
  const courseInfo = courseName ? { name: courseName, code: getCourseInfo(courseId).code } : getCourseInfo(courseId)
  const { viewMode } = useViewMode()
  const { getSelectedMaterialsMetadata, selectedMaterials } = useSelectedMaterials()
  
  // Get chat session context
  const { 
    activeSessionId,
    messages, 
    setMessages,
    isStudyMode, 
    setIsStudyMode,
    createNewSession
  } = useChatSession()
  
  // Local UI state
  const [showModeNotification, setShowModeNotification] = useState(false)
  const [notificationType, setNotificationType] = useState<'enter' | 'exit' | null>(null)
  const [showModeToggle, setShowModeToggle] = useState(false)
  const [showNewSessionAnimation, setShowNewSessionAnimation] = useState(false)
  
  // Generate a UUID-like session ID
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  // Create a session ID if none exists in context
  const [localSessionId, setLocalSessionId] = useState(generateUUID())
  const sessionId = activeSessionId || localSessionId
  
  // Count selected materials
  const selectedCount = selectedMaterials.filter(item => item.isSelected).length
  
  // Initialize messages with course-specific content
  const createInitialMessage = () => ({
    id: Date.now().toString(),
    role: 'assistant' as const,
    content: `Hello! I'm your AI Study Coach for ${courseInfo.name}. I'm here to help you prepare for ${deadlineTitle || 'your upcoming assignment'}. What specific topics would you like to review?`,
    timestamp: new Date()
  })
  
  // Initialize if no active session exists
  useEffect(() => {
    if (!activeSessionId && messages.length === 0) {
      // Create new session with initial message
      const initialMsg = createInitialMessage()
      createNewSession(localSessionId, initialMsg)
    }
  }, [activeSessionId]) // Only re-run if activeSessionId changes
  
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

  // Save messages to database
  const saveMessagesToDb = useCallback(async (updatedMessages: ChatMessage[], sessionTitle?: string) => {
    try {
      // Don't save if there are no messages or only the initial message
      if (updatedMessages.length === 0) {
        console.log('No messages to save');
        return;
      }
      
      console.log('Saving to DB - sessionId:', sessionId, 'messages:', updatedMessages.length);
      await saveChatSessionWithMessages(
        sessionId,
        '987655', // studentId
        courseId,
        deadlineId,
        isStudyMode,
        updatedMessages,
        sessionTitle
      );
      console.log('Successfully saved messages to database');
      // Trigger session history refresh after successful save
      window.dispatchEvent(new CustomEvent('refresh-sessions'));
    } catch (error) {
      console.error('Error saving messages to database:', error);
    }
  }, [sessionId, courseId, deadlineId, isStudyMode]);
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)
    
    // Check if this is the first user message and update session title
    const isFirstUserMessage = messages.filter(m => m.role === 'user').length === 0;
    if (isFirstUserMessage) {
      // Update session title with first 50 characters of user message
      const sessionTitle = userMessage.content.substring(0, 50) + (userMessage.content.length > 50 ? '...' : '');
      console.log('Updating session title to:', sessionTitle);
      
      // We'll need to pass the title to the save function
      await saveChatSessionWithMessages(
        sessionId,
        '987655', // studentId
        courseId,
        deadlineId,
        isStudyMode,
        updatedMessages,
        sessionTitle // Pass the title
      );
    } else {
      // Save to database immediately after user message
      saveMessagesToDb(updatedMessages);
    }

    try {
      // Get selected materials metadata
      const { material_ids, course_ids } = getSelectedMaterialsMetadata()
      
      // Log the metadata being sent
      console.log('=== CreateAI Metadata ===');
      console.log('Selected Materials Count:', material_ids.length);
      console.log('Material IDs:', material_ids);
      console.log('Course IDs:', course_ids);
      console.log('Student ID (hardcoded):', '987655');
      console.log('Session ID:', sessionId);
      console.log('========================');
      
      // Use CreateAI API if materials are selected, otherwise use the existing chat API
      if (material_ids.length > 0) {
        console.log('Using CreateAI API with selected materials')
        
        // Filter by source name if in study mode
        const sourceNames = isStudyMode ? 
          // Example filter - in a real app this would come from materials metadata
          ['Lecture Notes', 'Textbook', 'Assignment Instructions'] : 
          []
          
        const createAIResponse = await sendQueryToCreateAI(
          userMessage.content,
          material_ids,
          course_ids,
          sessionId,
          sourceNames,
          {
            // Study mode specific parameters
            temperature: isStudyMode ? 0.3 : 0.7,
            system_prompt: isStudyMode ? studyModeCustomPrompt : undefined,
            top_k: isStudyMode ? 8 : 5, // Retrieve more context in study mode
            reranker: true,
            // Additional parameters specific to study mode
            attempt_first_guidance: isStudyMode,
            include_practice_questions: isStudyMode
          }
        )
        
        if (!createAIResponse.success) {
          throw new Error(createAIResponse.error || 'Failed to get response from CreateAI')
        }
        
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: createAIResponse.response || 'I couldn\'t generate a response.',
          timestamp: new Date()
        }
        
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        
        // Save messages to database
        saveMessagesToDb(finalMessages);
      } else {
        // Fallback to existing chat API when no materials are selected
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(msg => ({ role: msg.role, content: msg.content })),
            studentId: '987655', // Updated to match CreateAI student ID
            courseId: courseId,
            stream: false,
            studyMode: isStudyMode,
            sessionId: sessionId, // Use consistent sessionId
            fallbackToMock: true,
            override_params: {
              temperature: isStudyMode ? 0.3 : 0.7, // Lower temperature for more focused responses in study mode
              max_tokens: isStudyMode ? 1500 : 1000, // Allow longer responses in study mode for explanations
              // Additional custom parameters for study mode
              attempt_first_guidance: isStudyMode,
              include_practice_questions: isStudyMode,
              allow_explanations: true
            }
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
        
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        
        // Save messages to database
        saveMessagesToDb(finalMessages);
      }
    } catch (error) {
      console.error('Error getting AI response:', error)
      
      // Fallback response if API fails
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting to my knowledge base right now. Please try again in a moment.',
        timestamp: new Date()
      }
      
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      
      // Save error message to database
      saveMessagesToDb(finalMessages);
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
                  deadlineTitle || 'AI Study Coach'
                )}
              </h2>
              <p className={cn("text-gray-600", viewMode === 'compact' ? 'text-xs' : 'text-sm')}>
                {isStudyMode 
                  ? 'Interactive guided learning with practice questions' 
                  : selectedCount > 0 
                    ? `Using ${selectedCount} selected material${selectedCount !== 1 ? 's' : ''} for context`
                    : 'Ask questions about your course content'}
              </p>
            </div>
            {isStudyMode && (
              <div className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-md">
                Active
              </div>
            )}
            {selectedCount > 0 && !isStudyMode && (
              <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {selectedCount}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* New session button */}
            <button 
              onClick={async () => {
              console.log('=== Starting new session ===');
              console.log('Current sessionId:', sessionId);
              console.log('Current messages count:', messages.length);
              
              // Only save session if it has user messages
              if (messages.length > 1) {
                console.log('Saving old session with messages:', messages.length);
                // Save to database first to ensure it's persisted
                try {
                  await saveChatSessionWithMessages(
                    sessionId,
                    '987655', // studentId
                    courseId,
                    deadlineId,
                    isStudyMode,
                    messages
                  );
                  console.log('Successfully saved session to database');
                } catch (err) {
                  console.error('Error saving session to database:', err);
                }
              }
              
              // Exit study mode if active
              if (isStudyMode) {
                setIsStudyMode(false);
              }
              
              // Show new session animation
              setShowNewSessionAnimation(true);
              
              setTimeout(() => {
                // Create a new session ID
                const newSessionId = generateUUID();
                console.log('Generated new session ID:', newSessionId);
                
                // Create default initial message without API call
                const newInitialMessage = createInitialMessage();
                console.log('Created initial message:', newInitialMessage);
                
                // Create a new session with this initial message
                createNewSession(newSessionId, newInitialMessage);
                
                // Update local session ID if we're not using context session
                if (!activeSessionId) {
                  setLocalSessionId(newSessionId);
                }
                
                // Force refresh the session history immediately
                window.dispatchEvent(new CustomEvent('refresh-sessions'));
                
                // Hide animation
                setShowNewSessionAnimation(false);
                console.log('=== New session created ===');
              }, 800);
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
                <div>
                  <MarkdownMessage 
                    content={message.content} 
                    isUser={message.role === 'user'}
                    className={cn(
                      message.role === 'user' ? "prose-invert" : "",
                      viewMode === 'compact' ? 'text-xs' : 'text-sm'
                    )}
                  />
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
          
          {/* New session animation */}
          {showNewSessionAnimation && (
            <div className="flex justify-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 animate-pulse">
                <div className="flex items-center gap-2 text-blue-700">
                  <Plus className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Creating new session...</span>
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
                        
                        // Determine if we're entering or exiting study mode
                        const enteringStudyMode = !isStudyMode;
                        
                        // Show notification and set type based on current mode state
                        setNotificationType(isStudyMode ? 'exit' : 'enter');
                        setShowModeNotification(true);
                        
                        // Hide notification after 3 seconds
                        setTimeout(() => {
                          setShowModeNotification(false);
                        }, 3000);
                        
                        // Define source names to filter by in study mode
                        // These would come from your actual content sources
                        const studyModeSourceNames = [
                          'Lecture Notes',
                          'Textbook',
                          'Practice Problems',
                          'Study Guides'
                        ];
                        
                        // Add system message noting the mode change
                        const customMessage = enteringStudyMode ?
                          'Now in Study Mode - I will guide you through structured learning with the attempt-first approach.' :
                          'Exited Study Mode - returning to standard assistance.';
                          
                        // Call API with custom system prompt to indicate mode change
                        fetch('/api/chat', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            messages: [{
                              role: 'user',
                              content: `[System: ${customMessage}]`
                            }],
                            studentId: '987655',
                            courseId: courseId,
                            studyMode: enteringStudyMode,
                            // Use the same sessionId for continuity
                            sessionId: sessionId,
                            override_params: {
                              system_prompt: enteringStudyMode ? 
                                studyModeCustomPrompt : 
                                'You are an AI study assistant. Acknowledge the mode change.', 
                              temperature: enteringStudyMode ? 0.3 : 0.7,
                              // Add source filtering when entering study mode
                              source_names: enteringStudyMode ? studyModeSourceNames : [],
                              // This response will never be seen by the user, but sets up the conversation context
                              silentMode: true 
                            }
                          }),
                        }).catch(err => console.error('Failed to update study mode:', err));
                        
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
                        setMessages([...messages, userMessage]);
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
                        setMessages([...messages, userMessage]);
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