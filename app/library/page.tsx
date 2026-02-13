'use client'

import { useState, useEffect } from 'react'
import { FileText, BookOpen, Clock, Filter, Search, Brain, Target, Lightbulb, GraduationCap, ArrowRight, ChevronRight, Sparkles, Trash2, X, AlertTriangle, RefreshCw, Loader2, Plus, Zap, CalendarDays, MessageSquare, ClipboardCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CustomStudySession, AIInsight } from '@/types'
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { InsightsList } from '@/components/insights/InsightsList'
import { InsightsService } from '@/lib/insights-service'
import { DeadlinesSection, getDeadlineTypeInfo } from '@/components/landing/DeadlinesSection'

type ViewTab = 'sessions' | 'insights' | 'deadlines'
type IconFilter = 'all' | 'BookOpen' | 'Brain' | 'Target' | 'FileText' | 'Lightbulb' | 'GraduationCap'

export default function BackpackPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<ViewTab>(tabParam === 'insights' ? 'insights' : 'sessions')
  const [searchQuery, setSearchQuery] = useState('')
  const [deadlineSearchQuery, setDeadlineSearchQuery] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all')
  const [selectedIcon, setSelectedIcon] = useState<IconFilter>('all')
  const [selectedDeadlineType, setSelectedDeadlineType] = useState<'all' | 'assignment' | 'quiz' | 'exam' | 'discussion'>('all')
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')
  const [selectedSessionTimeFilter, setSelectedSessionTimeFilter] = useState<'recent' | 'oldest'>('recent')
  
  // Helper function to get deadline label
  function getDeadlineLabel(date: Date): string {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return formatDistanceToNow(date, { addSuffix: true })
  }
  const [customSessions, setCustomSessions] = useState<CustomStudySession[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [loadingInsights, setLoadingInsights] = useState(true)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generatingCount, setGeneratingCount] = useState(3)
  const router = useRouter()

  // Load custom sessions from localStorage
  useEffect(() => {
    const loadCustomSessions = () => {
      const sessions = JSON.parse(localStorage.getItem('customStudySessions') || '[]')
      setCustomSessions(sessions)
    }
    
    loadCustomSessions()
    
    // Listen for storage changes
    const handleStorageChange = () => loadCustomSessions()
    window.addEventListener('storage', handleStorageChange)
    
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Fetch courses
  useEffect(() => {
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
    
    fetchCourses()
  }, [])

  // Initialize insights service
  const insightsService = InsightsService.getInstance()

  // Fetch deadlines data
  const [deadlines, setDeadlines] = useState<any[]>([])
  const [loadingDeadlines, setLoadingDeadlines] = useState(true)
  const [deadlinesError, setDeadlinesError] = useState<string | null>(null)
  
  // Fetch deadlines when on deadlines tab
  useEffect(() => {
    if (activeTab === 'deadlines') {
      const fetchDeadlines = async () => {
        setLoadingDeadlines(true)
        setDeadlinesError(null)
        try {
          const response = await fetch('/api/deadlines')
          const data = await response.json()
          
          if (data.success && data.deadlines) {
            // Process the deadlines to ensure dueDate is a Date object
            const processedDeadlines = data.deadlines.map((deadline: any) => ({
              ...deadline,
              dueDate: deadline.dueDate ? new Date(deadline.dueDate) : new Date()
            }))
            
            // Sort by due date (earliest first)
            const sortedDeadlines = processedDeadlines.sort((a: any, b: any) => {
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            })
            
            setDeadlines(sortedDeadlines)
          } else {
            setDeadlinesError('Failed to fetch deadlines')
          }
        } catch (err) {
          console.error('Error fetching deadlines:', err)
          setDeadlinesError('Error fetching deadlines')
        } finally {
          setLoadingDeadlines(false)
        }
      }
      
      fetchDeadlines()
    }
  }, [activeTab])

  // Filter deadlines based on course, type, time, and search query
  const filteredDeadlines = deadlines.filter(deadline => {
    const now = new Date()
    const deadlineDate = new Date(deadline.dueDate)
    
    const matchesCourse = selectedCourseId === 'all' || String(deadline.courseId) === String(selectedCourseId)
    const matchesType = selectedDeadlineType === 'all' || deadline.type === selectedDeadlineType
    
    // Time filtering
    const isPast = deadlineDate < now
    const isUpcoming = deadlineDate >= now
    const matchesTime = 
      selectedTimeFilter === 'all' || 
      (selectedTimeFilter === 'past' && isPast) || 
      (selectedTimeFilter === 'upcoming' && isUpcoming)
    
    // Search filtering
    const matchesSearch = deadlineSearchQuery === '' || 
      deadline.title.toLowerCase().includes(deadlineSearchQuery.toLowerCase()) || 
      deadline.courseName?.toLowerCase().includes(deadlineSearchQuery.toLowerCase()) || 
      deadline.courseCode?.toLowerCase().includes(deadlineSearchQuery.toLowerCase())
    
    return matchesCourse && matchesType && matchesTime && matchesSearch
  })

  // Fetch AI insights
  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingInsights(true)
      try {
        const studentId = '987654' // Default student ID from our mock data
        const insights = await insightsService.getInsights(studentId)
        setAiInsights(insights)
      } catch (err) {
        console.error('Error fetching insights:', err)
        setAiInsights([])
      } finally {
        setLoadingInsights(false)
      }
    }

    if (activeTab === 'insights') {
      fetchInsights()
    }

    // Subscribe to insights updates
    const unsubscribe = insightsService.subscribeToUpdates((updatedInsights) => {
      setAiInsights(updatedInsights)
    })

    return () => {
      unsubscribe()
    }
  }, [activeTab])

  // Function to refresh insights
  const refreshInsights = async () => {
    setLoadingInsights(true)
    try {
      const studentId = '987654'
      const insights = await insightsService.getInsights(studentId, true) // Force refresh
      setAiInsights(insights)
    } catch (err) {
      console.error('Error refreshing insights:', err)
    } finally {
      setLoadingInsights(false)
    }
  }
  
  // Function to generate specific number of insights
  const generateInsights = async (count: number) => {
    setLoadingInsights(true)
    setShowGenerateModal(false)
    try {
      const studentId = '987654'
      const insights = await insightsService.getInsights(studentId, true, count)
      setAiInsights(insights)
    } catch (err) {
      console.error('Error generating insights:', err)
    } finally {
      setLoadingInsights(false)
    }
  }
  
  // Filter sessions based on search, course and icon
  const filteredSessions = customSessions
    .filter(session => {
      const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (session.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
      const matchesCourse = selectedCourseId === 'all' || session.courseId === selectedCourseId
      const matchesIcon = selectedIcon === 'all' || session.icon === selectedIcon
      return matchesSearch && matchesCourse && matchesIcon
    })
    // Sort by most recent or oldest
    .sort((a, b) => {
      const dateA = new Date(a.lastAccessed).getTime()
      const dateB = new Date(b.lastAccessed).getTime()
      return selectedSessionTimeFilter === 'recent' ? dateB - dateA : dateA - dateB
    })

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Brain':
        return Brain
      case 'Target':
        return Target
      case 'Lightbulb':
        return Lightbulb
      case 'GraduationCap':
        return GraduationCap
      case 'FileText':
        return FileText
      case 'BookOpen':
      default:
        return BookOpen
    }
  }

  const getIconColor = (iconName: string) => {
    switch (iconName) {
      case 'Brain':
        return 'text-purple-600 bg-purple-50'
      case 'Target':
        return 'text-red-600 bg-red-50'
      case 'Lightbulb':
        return 'text-yellow-600 bg-yellow-50'
      case 'GraduationCap':
        return 'text-blue-600 bg-blue-50'
      case 'FileText':
        return 'text-green-600 bg-green-50'
      case 'BookOpen':
      default:
        return 'text-indigo-600 bg-indigo-50'
    }
  }

  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString)
    return formatDistanceToNow(date, { addSuffix: true })
  }
  
  // Function to format days until/since deadline
  const formatDaysUntil = (date: Date | null | undefined): string => {
    if (!date) return 'Unknown date'
    
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 0) {
      // Past deadline
      if (diffDays === -1) return 'Yesterday'
      return `${Math.abs(diffDays)} days ago`
    }
    return `In ${diffDays} days`
  }
  
  // Handle deleting a session
  const handleDeleteSession = () => {
    if (!sessionToDelete) return
    
    // Filter out the session to delete
    const updatedSessions = customSessions.filter(session => session.id !== sessionToDelete)
    
    // Update state
    setCustomSessions(updatedSessions)
    
    // Save to localStorage
    localStorage.setItem('customStudySessions', JSON.stringify(updatedSessions))
    
    // Reset states
    setSessionToDelete(null)
    setDeleteConfirmOpen(false)
    
    // Dispatch storage event to update other tabs
    window.dispatchEvent(new Event('storage'))
  }
  
  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setSessionToDelete(null)
    setDeleteConfirmOpen(false)
  }

  // Get course name by ID
  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.course_id === courseId)
    return course ? `${course.course_code}: ${course.course_name}` : 'Unknown Course'
  }

  const getCourseCode = (courseId: string, isAIInsight = false) => {
    if (isAIInsight) return 'AI generated'
    const course = courses.find(c => c.course_id === courseId)
    return course ? course.course_code : 'N/A'
  }
  
  // Generate a color based on courseId for consistency
  const getCourseColor = (courseId: string) => {
    // Predefined ASU colors
    const colors = [
      '#8C1D40', // ASU Maroon
      '#FF6900', // ASU Orange
      '#00A3E0', // ASU Blue
      '#78BE20', // ASU Green
      '#6B46C1', // Purple
      '#1E429F', // Navy
      '#9B2FAE'  // Pink
    ]
    
    // Use the courseId to select a color deterministically
    const colorIndex = parseInt(courseId) % colors.length
    return colors[colorIndex]
  }

  return (
    <div className="p-6 bg-gray-50">
    
      {/* Page header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-1.5 h-8 bg-yellow-400 rounded-sm"></div>
        <h1 className="text-2xl font-bold text-gray-900">Study Sessions</h1>
      </div>
      
      {/* Generate insights modal */}
      {showGenerateModal && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowGenerateModal(false)} />
          
          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 p-6 z-50">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-[#8C1D40]" />
              <h3 className="text-lg font-semibold">Generate AI Insights</h3>
            </div>
            
            <p className="text-gray-700 mb-4">
              How many personalized study insights would you like to generate?
            </p>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1, 3, 5].map(num => (
                <button
                  key={num}
                  onClick={() => setGeneratingCount(num)}
                  className={cn(
                    "py-3 px-4 rounded-md font-medium transition-colors",
                    generatingCount === num
                      ? "bg-[#8C1D40] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom number:
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={generatingCount}
                onChange={(e) => setGeneratingCount(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8C1D40] focus:border-[#8C1D40]"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum: 5 insights</p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => generateInsights(generatingCount)}
                className="px-4 py-2 bg-[#8C1D40] text-white rounded-md hover:bg-[#8C1D40]/90 font-medium flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate {generatingCount} Insights
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Delete confirmation modal */}
      {deleteConfirmOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 z-40" onClick={closeDeleteModal} />
          
          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 p-6 z-50">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Delete Session</h3>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this study session? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteSession}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}

      {/* Tabs */}
      <div className="mb-0 relative">
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200" />
        <nav className="flex relative h-12">{/* Fixed height container for tabs */}
          <button
            onClick={() => setActiveTab('sessions')}
            className={cn(
              "py-3 px-6 font-medium text-sm transition-all relative rounded-t-lg flex items-center gap-2 z-10 h-full",
              activeTab === 'sessions'
                ? "bg-white text-yellow-600 border border-gray-200 border-b-white shadow-sm -mb-0.5"
                : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-700 mr-1"
            )}
            style={{
              transform: activeTab === 'sessions' ? 'translateY(0)' : 'translateY(1px)',
              transition: 'transform 0.15s ease-in-out, background-color 0.15s ease-in-out'
            }}
          >
            <BookOpen className="w-4 h-4" />
            Custom Sessions
          </button>
          <button
            onClick={() => setActiveTab('deadlines')}
            className={cn(
              "py-3 px-6 font-medium text-sm transition-all relative rounded-t-lg flex items-center gap-2 z-10 h-full",
              activeTab === 'deadlines'
                ? "bg-white text-blue-600 border border-gray-200 border-b-white shadow-sm -mb-0.5"
                : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-700 mr-1"
            )}
            style={{
              transform: activeTab === 'deadlines' ? 'translateY(0)' : 'translateY(1px)',
              transition: 'transform 0.15s ease-in-out, background-color 0.15s ease-in-out'
            }}
          >
            <CalendarDays className="w-4 h-4" />
            Deadlines
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={cn(
              "py-3 px-6 font-medium text-sm transition-all relative rounded-t-lg flex items-center gap-2 z-10 h-full",
              activeTab === 'insights'
                ? "bg-white text-green-600 border border-gray-200 border-b-white shadow-sm -mb-0.5"
                : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-700"
            )}
            style={{
              transform: activeTab === 'insights' ? 'translateY(0)' : 'translateY(1px)',
              transition: 'transform 0.15s ease-in-out, background-color 0.15s ease-in-out'
            }}
          >
            <Sparkles className="w-4 h-4" />
            AI Insights
          </button>
        </nav>
      </div>

      {activeTab === 'deadlines' ? (
        <div className="bg-white rounded-lg rounded-tl-none shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-[#8C1D40]" />
              <p className="text-sm text-gray-600">
                View {selectedTimeFilter === 'all' ? 'all' : selectedTimeFilter === 'upcoming' ? 'upcoming' : 'past'} deadlines 
                {selectedDeadlineType !== 'all' ? ` (${selectedDeadlineType}s only)` : ''} 
                {selectedCourseId === 'all' ? ' across all courses' : ` for ${courses.find(c => c.course_id === selectedCourseId)?.course_code || 'selected course'}`}.
              </p>
            </div>
          </div>
          
          {/* Filters for deadlines */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Course Filter - Keep visible */}
              <div className="flex flex-wrap gap-2 items-center">
                <h3 className="text-sm font-semibold text-gray-700 mr-2">Filter by course:</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCourseId('all')}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium transition-colors",
                      selectedCourseId === 'all'
                        ? "bg-yellow-400 text-gray-800"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                    style={{
                      borderRadius: '4px',
                      border: 'none',
                      outline: 'none'
                    }}
                  >
                    All Courses
                  </button>
                  {!loadingCourses && courses.map(course => {
                    return (
                      <button
                        key={course.course_id}
                        onClick={() => setSelectedCourseId(course.course_id)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium transition-colors",
                          selectedCourseId === course.course_id
                            ? "bg-gray-300 text-gray-800"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                        style={{ 
                          borderRadius: '4px',
                          border: 'none',
                          outline: 'none'
                        }}
                      >
                        <span>{course.course_code}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Type Filter - Convert to dropdown */}
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-700">Type:</h3>
                <select
                  value={selectedDeadlineType}
                  onChange={(e) => setSelectedDeadlineType(e.target.value as any)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                >
                  <option value="all">All Types</option>
                  <option value="assignment">Assignments</option>
                  <option value="quiz">Quizzes</option>
                  <option value="exam">Exams</option>
                  <option value="discussion">Discussions</option>
                </select>
              </div>
              
              {/* Time Filter - Convert to dropdown */}
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-700">Time:</h3>
                <select
                  value={selectedTimeFilter}
                  onChange={(e) => setSelectedTimeFilter(e.target.value as any)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                >
                  <option value="all">All Deadlines</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>
              
              {/* Search - Added to match other tabs */}
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-700">Search:</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search deadlines..."
                    value={deadlineSearchQuery}
                    onChange={(e) => setDeadlineSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm w-48"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Deadlines Content */}
          {loadingDeadlines ? (
            <div className="p-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-solid border-current border-r-transparent text-[#8C1D40] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-3"></div>
              <p className="text-gray-500">Loading deadlines...</p>
            </div>
          ) : deadlinesError ? (
            <div className="p-16 text-center">
              <p className="text-red-500">{deadlinesError}</p>
              <button 
                className="mt-2 text-[#8C1D40] hover:underline"
                onClick={() => {
                  setActiveTab('deadlines');
                }}
              >
                Try again
              </button>
            </div>
          ) : filteredDeadlines.length > 0 ? (
            <div className="max-h-[600px] overflow-y-auto">
              {filteredDeadlines.map((deadline) => (
                <div 
                  key={deadline.id}
                  className={cn(
                    "p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors",
                    new Date(deadline.dueDate) < new Date() ? "bg-gray-50" : ""
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon with background */}
                    <div className={cn(
                      "p-2 rounded-lg flex-shrink-0",
                      getDeadlineTypeInfo(deadline.type).bgColor,
                      getDeadlineTypeInfo(deadline.type).color
                    )}>
                      {getDeadlineTypeInfo(deadline.type).icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Deadline title and badge */}
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 text-sm">
                          {deadline.title}
                        </h3>
                        <span className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded-full",
                          getDeadlineTypeInfo(deadline.type).badgeColor
                        )}>
                          {deadline.type.charAt(0).toUpperCase() + deadline.type.slice(1)}
                        </span>
                      </div>
                      
                      {/* Course info */}
                      <p className="text-xs text-gray-600 mb-2">
                        {deadline.courseCode} - {deadline.courseName}
                      </p>
                      
                      {/* Due date info */}
                      <div className="flex items-center gap-3 text-xs">
                        <div className={cn(
                          "flex items-center gap-1",
                          new Date(deadline.dueDate) < new Date() ? "text-red-500" : "text-gray-500"
                        )}>
                          <Clock className="w-3 h-3" />
                          <span>{getDeadlineLabel(deadline.dueDate)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <CalendarDays className="w-3 h-3" />
                          <span suppressHydrationWarning>{format(deadline.dueDate, 'MMM d, h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action button */}
                    <div className="flex-shrink-0">
                      <Link 
                        href={`/preparation/${deadline.courseId}/${deadline.id}`}
                        className="px-4 py-2 bg-[#8C1D40] text-white rounded-md text-xs flex items-center gap-1 hover:bg-[#8C1D40]/90 transition-colors shadow-sm"
                      >
                        {new Date(deadline.dueDate) < new Date() ? 'Revisit' : 'Study'}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center">
              <p className="text-gray-500">No deadlines found matching your filters.</p>
            </div>
          )}
        </div>
      ) : activeTab === 'sessions' ? (
        <div className="bg-white rounded-lg rounded-tl-none shadow-sm border border-gray-200 border-t-0">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-[#8C1D40]" />
              <p className="text-sm text-gray-600">
                View and manage your custom study sessions.
              </p>
            </div>
          </div>

          {/* Filter Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Course Filter - Button style like deadlines tab */}
              <div className="flex flex-wrap gap-2 items-center">
                <h3 className="text-sm font-semibold text-gray-700 mr-2">Filter by course:</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCourseId('all')}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium transition-colors",
                      selectedCourseId === 'all'
                        ? "bg-yellow-400 text-gray-800"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                    style={{
                      borderRadius: '4px',
                      border: 'none',
                      outline: 'none'
                    }}
                  >
                    All Courses
                  </button>
                  {!loadingCourses && courses.map(course => {
                    return (
                      <button
                        key={course.course_id}
                        onClick={() => setSelectedCourseId(course.course_id)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium transition-colors",
                          selectedCourseId === course.course_id
                            ? "bg-gray-300 text-gray-800"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                        style={{ 
                          borderRadius: '4px',
                          border: 'none',
                          outline: 'none'
                        }}
                      >
                        <span>{course.course_code}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Time Filter */}
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-700">Sort by:</h3>
                <select
                  value={selectedSessionTimeFilter}
                  onChange={(e) => setSelectedSessionTimeFilter(e.target.value as 'recent' | 'oldest')}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
              
              {/* Search */}
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-700">Search:</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm w-48"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Custom Sessions Cards */}
          <div className="p-4">
            <AnimatePresence>
              {filteredSessions.length > 0 ? (
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {filteredSessions.map((session, index) => {
                    const Icon = getIconComponent(session.icon)
                    const course = courses.find(c => c.course_id === session.courseId)
                    
                    // Get type label based on icon
                    const typeLabel = {
                      'BookOpen': 'Study Guide',
                      'Brain': 'Knowledge Map',
                      'Target': 'Practice Test',
                      'FileText': 'Notes',
                      'Lightbulb': 'Concepts',
                      'GraduationCap': 'Course Review'
                    }[session.icon] || 'Study Session';
                    
                    // Get color based on course
                    const courseColor = course ? getCourseColor(course.course_id) : '#8C1D40';
                    
                    return (
                      <motion.div
                        key={session.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:bg-gray-50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ 
                          duration: 0.2, 
                          delay: index * 0.05
                        }}
                        onClick={(e) => {
                          // Prevent triggering if clicking the Continue button
                          if (!(e.target as HTMLElement).closest('button')) {
                            router.push(`/preparation/custom/${session.id}`)
                          }
                        }}
                      >
                        <div className="p-4 px-6">
                          <div className="flex items-start gap-3 justify-between">
                            {/* Icon with background */}
                            <div 
                              className="p-2 rounded-lg flex-shrink-0 text-white"
                              style={{ backgroundColor: '#8C1D40' }}
                            >
                              <Icon className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0 pr-4">
                              {/* Session title */}
                              <div className="mb-1">
                                <h3 className="font-medium text-gray-900 text-sm">
                                  {session.name}
                                </h3>
                              </div>
                              
                              {/* Course info */}
                              <p className="text-xs text-gray-600 mb-2">
                                {getCourseCode(session.courseId)}
                                {session.description && ` - ${session.description}`}
                              </p>
                              
                              {/* Date info */}
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Last accessed {formatSessionDate(session.lastAccessed)}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSessionToDelete(session.id);
                                  setDeleteConfirmOpen(true);
                                }}
                                className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Delete session"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/preparation/custom/${session.id}`);
                                }}
                                className="px-4 py-2 bg-[#8C1D40] text-white rounded-md text-xs flex items-center gap-1 hover:bg-[#8C1D40]/90 transition-colors shadow-sm"
                              >
                                Study
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              ) : (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-gray-500 mb-4">No study sessions found.</p>
                  <p className="text-sm text-gray-400">Create a new study session from the top bar to get started!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* AI Insights Tab */
        <div className="bg-white rounded-lg rounded-tl-none shadow-sm border border-gray-200 border-t-0">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#8C1D40]" />
                <p className="text-sm text-gray-600">
                  AI-generated study recommendations based on your performance and knowledge gaps.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowGenerateModal(true)}
                  className="px-3 py-1.5 bg-[#8C1D40] text-white rounded-md hover:bg-[#8C1D40]/90 font-medium text-sm flex items-center gap-1.5"
                  disabled={loadingInsights}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Generate
                </button>
                <button 
                  onClick={refreshInsights}
                  className="text-[#8C1D40] p-1.5 rounded-full hover:bg-[#f9e5e5] border border-[#8C1D40]/30"
                  aria-label="Refresh insights"
                  title="Refresh insights"
                  disabled={loadingInsights}
                >
                  {loadingInsights ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            {loadingInsights ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-10 w-10 text-[#8C1D40] animate-spin mb-3" />
                <p className="text-sm text-gray-500">Loading AI insights...</p>
              </div>
            ) : aiInsights.length === 0 ? (
              <div className="text-center py-16">
                <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No AI insights available yet.</p>
                <button
                  onClick={refreshInsights}
                  className="text-sm text-[#8C1D40] hover:underline"
                >
                  Generate insights
                </button>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {aiInsights.map((insight, index) => {
                    // Choose icon based on type
                    const Icon = getIconComponent(insight.type === 'review' ? 'BookOpen' : 
                                                  insight.type === 'practice' ? 'Target' : 
                                                  insight.type === 'strengthen' ? 'Brain' : 'Sparkles');
                    
                    return (
                      <motion.div
                        key={insight.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:bg-gray-50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ 
                          duration: 0.2, 
                          delay: index * 0.05
                        }}
                        onClick={() => router.push(`/study/${insight.courseId}/${insight.topic}`)}
                      >
                        <div className="p-4 px-6">
                          <div className="flex items-start gap-3 justify-between">
                            {/* Icon with background */}
                            <div className={cn(
                              "p-2 rounded-lg flex-shrink-0",
                              insight.priority === 'high' ? "bg-red-50 text-red-700" :
                              insight.priority === 'medium' ? "bg-yellow-50 text-yellow-700" :
                              insight.priority === 'low' ? "bg-green-50 text-green-700" :
                              "bg-gray-50 text-gray-700"
                            )}>
                              <Icon className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0 pr-4">
                              {/* Insight title */}
                              <div className="mb-1">
                                <h3 className="font-medium text-gray-900 text-sm">
                                  {insight.title}
                                </h3>
                              </div>
                              
                              {/* Course info and description */}
                              <p className="text-xs text-gray-600 mb-2">
                                {insight.courseCode} - {insight.description}
                              </p>
                              
                              {/* Duration and deadline */}
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{insight.duration} minutes</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CalendarDays className="w-3 h-3" />
                                  <span className="text-gray-500">
                                    {insight.type === 'review' ? 'Review' : 
                                     insight.type === 'practice' ? 'Practice' : 
                                     insight.type === 'strengthen' ? 'Strengthen' : 
                                     'Prepare'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Action button */}
                            <div className="flex-shrink-0">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/study/${insight.courseId}/${insight.topic}`);
                                }}
                                className="px-4 py-2 bg-[#8C1D40] text-white rounded-md text-xs flex items-center gap-1 hover:bg-[#8C1D40]/90 transition-colors shadow-sm"
                              >
                                Study
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      )}
    </div>
  )
}