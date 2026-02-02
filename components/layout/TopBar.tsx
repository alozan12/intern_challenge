'use client'

import { useState, useEffect } from 'react'
import { Clock, Bell, MessageSquare, Users, X, PlayCircle, PauseCircle, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

// Pomodoro Timer Tool
function PomodoroTool() {
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const [timeLeft, setTimeLeft] = useState(mode === 'focus' ? 25 * 60 : 5 * 60) // 25 min focus, 5 min break
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // Add timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      // When timer ends
      setIsActive(false)
      // Switch modes automatically
      const newMode = mode === 'focus' ? 'break' : 'focus'
      setMode(newMode)
      setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, mode])

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60)
  }

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen)
  }

  return (
    <div className="relative">
      <button 
        onClick={togglePanel}
        className={cn(
          "p-2 rounded-md transition-colors flex items-center gap-2",
          isPanelOpen || isActive ? "bg-asu-maroon/10 text-asu-maroon" : "hover:bg-gray-100"
        )}
        title="Pomodoro Timer"
      >
        <Clock className="w-5 h-5" />
        {isActive && (
          <span className="text-xs font-medium">{formatTime(timeLeft)}</span>
        )}
      </button>

      {/* Pomodoro Panel */}
      {isPanelOpen && (
        <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Pomodoro Timer</h3>
            <button onClick={togglePanel} className="text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex justify-center mb-4">
            <div className="text-3xl font-bold text-gray-900">{formatTime(timeLeft)}</div>
          </div>
          
          <div className="flex justify-center space-x-3 mb-4">
            <button 
              onClick={toggleTimer}
              className="p-2 rounded-full bg-asu-maroon/10 hover:bg-asu-maroon/20 text-asu-maroon"
            >
              {isActive ? <PauseCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
            </button>
            <button
              onClick={resetTimer}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex rounded-md overflow-hidden">
            <button 
              onClick={() => {
                setMode('focus')
                setTimeLeft(25 * 60)
                setIsActive(false)
              }}
              className={cn(
                "flex-1 py-2 text-center text-sm font-medium",
                mode === 'focus' 
                  ? "bg-asu-maroon text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Focus (25m)
            </button>
            <button 
              onClick={() => {
                setMode('break')
                setTimeLeft(5 * 60)
                setIsActive(false)
              }}
              className={cn(
                "flex-1 py-2 text-center text-sm font-medium",
                mode === 'break' 
                  ? "bg-asu-maroon text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Break (5m)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Reminders Tool
function RemindersTool() {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [hasNotifications, setHasNotifications] = useState(true)

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen)
    if (hasNotifications) setHasNotifications(false)
  }

  const mockReminders = [
    { id: 1, text: "Complete CSE 110 project", time: "Today, 8:00 PM" },
    { id: 2, text: "Study for MAT 265 quiz", time: "Tomorrow, 3:00 PM" }
  ]

  return (
    <div className="relative">
      <button 
        onClick={togglePanel}
        className={cn(
          "p-2 rounded-md transition-colors relative",
          isPanelOpen ? "bg-asu-maroon/10 text-asu-maroon" : "hover:bg-gray-100"
        )}
        title="Reminders"
      >
        <Bell className="w-5 h-5" />
        {hasNotifications && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {/* Reminders Panel */}
      {isPanelOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Reminders</h3>
            <button onClick={togglePanel} className="text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
            {mockReminders.map(reminder => (
              <div key={reminder.id} className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-900">{reminder.text}</p>
                <p className="text-xs text-gray-500">{reminder.time}</p>
              </div>
            ))}
          </div>
          
          <button className="w-full py-2 text-sm font-medium text-center text-asu-maroon hover:bg-asu-maroon/5 rounded-md">
            Set New Reminder
          </button>
        </div>
      )}
    </div>
  )
}

// AI Chat Tool
function AIChatTool() {
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen)
  }

  return (
    <div className="relative">
      <button 
        onClick={togglePanel}
        className={cn(
          "p-2 rounded-md transition-colors",
          isPanelOpen ? "bg-asu-maroon/10 text-asu-maroon" : "hover:bg-gray-100"
        )}
        title="AI Study Assistant"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* AI Chat Panel */}
      {isPanelOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 flex flex-col" style={{ height: "400px" }}>
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">AI Study Assistant</h3>
            <button onClick={togglePanel} className="text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="mb-3 max-w-[80%]">
              <div className="bg-gray-200 rounded-lg p-3 inline-block">
                <p className="text-sm">Hi! I'm your Study Assistant. Ask me anything about your courses!</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 border-t border-gray-200">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ask a question..." 
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-asu-maroon/50 focus:border-asu-maroon"
              />
              <button className="px-4 py-2 bg-asu-maroon text-white rounded-md text-sm font-medium hover:bg-asu-maroon/90">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Users Tool
function UsersTool() {
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen)
  }

  const mockUsers = [
    { id: 1, name: "Alex Smith", status: "online", avatar: "AS" },
    { id: 2, name: "Jamie Wong", status: "offline", avatar: "JW" },
    { id: 3, name: "Taylor Reed", status: "online", avatar: "TR" }
  ]

  return (
    <div className="relative">
      <button 
        onClick={togglePanel}
        className={cn(
          "p-2 rounded-md transition-colors",
          isPanelOpen ? "bg-asu-maroon/10 text-asu-maroon" : "hover:bg-gray-100"
        )}
        title="Study Group"
      >
        <Users className="w-5 h-5" />
      </button>

      {/* Users Panel */}
      {isPanelOpen && (
        <div className="absolute right-0 top-12 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Study Group</h3>
            <button onClick={togglePanel} className="text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3 mb-4">
            {mockUsers.map(user => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium">
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                </div>
                <div className="flex items-center">
                  <span 
                    className={cn(
                      "w-2 h-2 rounded-full mr-1",
                      user.status === "online" ? "bg-green-500" : "bg-gray-300"
                    )}
                  />
                  <span className="text-xs text-gray-500">{user.status}</span>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full py-2 text-sm font-medium text-center text-asu-maroon hover:bg-asu-maroon/5 rounded-md">
            Invite Study Partner
          </button>
        </div>
      )}
    </div>
  )
}

export function TopBar() {
  return (
    <div className="h-14 bg-white border-b border-gray-200 shadow-sm flex items-center justify-end px-8 gap-3 z-40 relative">
      <PomodoroTool />
      <RemindersTool />
      <AIChatTool />
      <UsersTool />
    </div>
  )
}