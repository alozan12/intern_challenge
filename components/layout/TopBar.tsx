'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Clock, Bell, MessageSquare, Users, X, PlayCircle, PauseCircle, RotateCcw, SunMedium, Menu, ChevronRight, RefreshCw, Plus, BookOpen, Brain, Target, FileText, Lightbulb, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useViewMode } from '@/context/ViewModeContext'

interface TopBarProps {
  onToggleSidebar?: () => void;
  isSidebarMinimized?: boolean;
}

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

// New Study Button Tool
function NewStudyButton() {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'BookOpen',
    courseId: ''
  })
  const [courses, setCourses] = useState<any[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const router = useRouter()

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen)
    if (!isPanelOpen) {
      // Reset form when opening
      setFormData({ name: '', description: '', icon: 'BookOpen', courseId: '' })
      // Fetch courses when opening
      fetchCourses()
    }
  }

  const fetchCourses = async () => {
    setLoadingCourses(true)
    try {
      const response = await fetch('/api/courses')
      const data = await response.json()
      if (data.success) {
        setCourses(data.courses)
      }
    } catch (err) {
      console.error('Error fetching courses:', err)
    } finally {
      setLoadingCourses(false)
    }
  }

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.courseId) return

    // Generate unique ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create session object
    const newSession = {
      id: sessionId,
      name: formData.name,
      description: formData.description,
      icon: formData.icon,
      courseId: formData.courseId,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      materials: []
    }

    // Save to localStorage
    const existingSessions = JSON.parse(localStorage.getItem('customStudySessions') || '[]')
    existingSessions.push(newSession)
    localStorage.setItem('customStudySessions', JSON.stringify(existingSessions))

    // Close modal and navigate
    setIsPanelOpen(false)
    router.push(`/preparation/custom/${sessionId}`)
  }

  const icons = [
    { name: 'BookOpen', icon: BookOpen, label: 'Book' },
    { name: 'Brain', icon: Brain, label: 'Brain' },
    { name: 'Target', icon: Target, label: 'Target' },
    { name: 'FileText', icon: FileText, label: 'Notes' },
    { name: 'Lightbulb', icon: Lightbulb, label: 'Ideas' },
    { name: 'GraduationCap', icon: GraduationCap, label: 'Academic' }
  ]

  return (
    <div className="relative">
      <button
        onClick={togglePanel}
        className={cn(
          "px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 text-sm font-medium",
          isPanelOpen 
            ? "bg-asu-maroon text-white" 
            : "bg-asu-maroon/10 text-asu-maroon hover:bg-asu-maroon/20"
        )}
      >
        <Plus className="w-4 h-4" />
        <span>New Study</span>
      </button>

      {/* New Study Modal */}
      {isPanelOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={togglePanel}
          />
          
          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 p-6 z-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Create New Study Session</h3>
              <button onClick={togglePanel} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Biology Midterm Review"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-asu-maroon/50 focus:border-asu-maroon"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What will you be studying?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-asu-maroon/50 focus:border-asu-maroon resize-none"
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course *
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-asu-maroon/50 focus:border-asu-maroon"
                  disabled={loadingCourses}
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.course_id} value={course.course_id}>
                      {course.course_code}: {course.course_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose which course materials to access in this session
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose an Icon
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {icons.map(({ name, icon: Icon, label }) => (
                    <button
                      key={name}
                      onClick={() => setFormData({ ...formData, icon: name })}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-md border-2 transition-all",
                        formData.icon === name
                          ? "border-asu-maroon bg-asu-maroon/5"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <Icon className={cn(
                        "w-6 h-6",
                        formData.icon === name ? "text-asu-maroon" : "text-gray-600"
                      )} />
                      <span className={cn(
                        "text-xs",
                        formData.icon === name ? "text-asu-maroon font-medium" : "text-gray-500"
                      )}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={togglePanel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!formData.name.trim() || !formData.courseId}
                className={cn(
                  "flex-1 px-4 py-2 rounded-md font-medium transition-colors",
                  formData.name.trim() && formData.courseId
                    ? "bg-asu-maroon text-white hover:bg-asu-maroon/90"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                Create
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function TopBar({ onToggleSidebar, isSidebarMinimized }: TopBarProps = {}) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const { viewMode, setViewMode } = useViewMode();
  
  // Sync state
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [courseName, setCourseName] = useState<string | null>(null)
  
  // Get current date and time-appropriate greeting (always calculate for the date)
  const { formattedDate, greeting } = getTimeBasedGreeting();
  
  // Fetch course info for preparation pages
  useEffect(() => {
    const fetchCourseInfo = async () => {
      // Check if we're on a preparation page with a course ID
      const preparationMatch = pathname.match(/\/preparation\/([^/]+)/);
      if (preparationMatch && preparationMatch[1]) {
        const courseId = preparationMatch[1];
        
        try {
          // Fetch course info from API
          const coursesResponse = await fetch('/api/courses');
          const coursesData = await coursesResponse.json();
          
          if (coursesData.success) {
            const course = coursesData.courses.find((c: any) => c.course_id === courseId);
            if (course) {
              setCourseName(`${course.course_code}: ${course.course_name}`);
              return;
            }
          }
        } catch (err) {
          console.error('Error fetching course info for top bar:', err);
        }
      }
      
      // If we're not on a course page or couldn't fetch data, clear the course name
      setCourseName(null);
    };
    
    fetchCourseInfo();
  }, [pathname]);
  
  // Get page title based on current path
  const getPageTitle = () => {
    if (isLandingPage) return `${greeting}, Sun Devil!`;
    if (pathname.startsWith('/preparation')) {
      // If we have a specific course name, use that
      if (courseName) return courseName;
      // Otherwise fall back to generic title
      return "Coursework";
    }
    if (pathname.startsWith('/analytics')) return "Analytics";
    if (pathname.startsWith('/calendar')) return "Academic Calendar";
    if (pathname.startsWith('/library')) return "Backpack";
    if (pathname.startsWith('/settings')) return "Settings";
    if (pathname.startsWith('/insights')) return "AI Study Insights";
    return "";
  }
  
  const pageTitle = getPageTitle();

  // Handle sync action
  const handleSync = async () => {
    setIsSyncing(true)
    
    // Mock sync process - in real app this would sync with Canvas API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLastSyncTime(new Date())
    setIsSyncing(false)
  }

  // Format last sync time
  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never synced'
    
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    return date.toLocaleDateString()
  }
  
  return (
    <div className="h-14 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-8 z-40 relative">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          {/* Toggle sidebar button - only show for Coursework */}
          {pathname.startsWith('/preparation') && onToggleSidebar && (
            <button 
              onClick={onToggleSidebar}
              className="p-1.5 mr-2 rounded-md hover:bg-gray-100 transition-colors"
              title={isSidebarMinimized ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarMinimized ? 
                <ChevronRight className="w-5 h-5 text-gray-600" /> : 
                <Menu className="w-5 h-5 text-gray-600" />
              }
            </button>
          )}
          {pageTitle} {isLandingPage && <SunMedium className="text-yellow-400 h-6 w-6" />}
        </h1>
        <p className="text-gray-500 ml-4">{formattedDate}</p>
      </div>
      <div className="flex items-center gap-3">
        <NewStudyButton />
        <div className="h-6 w-px bg-gray-300" />
        <PomodoroTool />
        <RemindersTool />
        <AIChatTool />
        <UsersTool />
        {/* Sync Section */}
        <div className="flex items-center ml-3">
          <div className="h-6 w-px bg-gray-300 mx-2" />
          <div className="text-xs text-gray-500">
            <div>Last sync:</div>
            <div className="font-medium">{formatLastSync(lastSyncTime)}</div>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={cn(
              "p-2 rounded-md transition-colors flex items-center gap-2 ml-2",
              isSyncing 
                ? "text-gray-400 cursor-not-allowed" 
                : "text-gray-600 hover:bg-gray-100 hover:text-asu-maroon"
            )}
            title={isSyncing ? "Syncing..." : "Sync with Canvas"}
          >
            <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper function to get time-appropriate greeting and formatted date
function getTimeBasedGreeting() {
  const today = new Date();
  const currentHour = today.getHours();
  
  // Determine greeting based on time of day
  let greeting;
  if (currentHour < 12) {
    greeting = 'Good morning';
  } else if (currentHour < 18) {
    greeting = 'Good afternoon';
  } else {
    greeting = 'Good evening';
  }
  
  // Format date
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
  const month = today.toLocaleDateString('en-US', { month: 'long' });
  const date = today.getDate();
  const formattedDate = `${dayOfWeek}, ${month} ${date}`;
  
  return { formattedDate, greeting };
}