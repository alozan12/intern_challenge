'use client'

import { useState, useEffect } from 'react'
import { FileText, BookOpen, Clock, Filter, Search, Brain, Target, Lightbulb, GraduationCap, ArrowRight, ChevronRight, Sparkles, Trash2, X, AlertTriangle, RefreshCw, Loader2, Plus, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import { CustomStudySession, AIInsight } from '@/types'
import { format, formatDistanceToNow } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { InsightsList } from '@/components/insights/InsightsList'
import { InsightsService } from '@/lib/insights-service'

type ViewTab = 'sessions' | 'insights'
type IconFilter = 'all' | 'BookOpen' | 'Brain' | 'Target' | 'FileText' | 'Lightbulb' | 'GraduationCap'

export default function BackpackPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<ViewTab>(tabParam === 'insights' ? 'insights' : 'sessions')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all')
  const [selectedIcon, setSelectedIcon] = useState<IconFilter>('all')
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
  
  const filteredSessions = customSessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (session.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    const matchesCourse = selectedCourseId === 'all' || session.courseId === selectedCourseId
    const matchesIcon = selectedIcon === 'all' || session.icon === selectedIcon
    return matchesSearch && matchesCourse && matchesIcon
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
  
  // Function to format days until deadline
  const formatDaysUntil = (date: Date): string => {
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 0) return 'Overdue'
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
      <div className="mb-6">
        <nav className="flex space-x-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('sessions')}
            className={cn(
              "pb-3 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === 'sessions'
                ? "border-yellow-400 text-yellow-500"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            Custom Sessions
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={cn(
              "pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2",
              activeTab === 'insights'
                ? "border-yellow-400 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <Sparkles className="w-4 h-4" />
            AI Insights
          </button>
        </nav>
      </div>

      {activeTab === 'sessions' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          {/* Search bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your study sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>
          </div>

          {/* Filter Section */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Filter:</h3>
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
                const courseColor = getCourseColor(course.course_id);
                return (
                  <button
                    key={course.course_id}
                    onClick={() => setSelectedCourseId(course.course_id)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5",
                      selectedCourseId === course.course_id
                        ? "text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                    style={{ 
                      backgroundColor: selectedCourseId === course.course_id 
                        ? courseColor 
                        : undefined,
                      borderRadius: '4px',
                      border: 'none',
                      outline: 'none'
                    }}
                  >
                    <div 
                      className={cn(
                        "w-2 h-2 rounded-full",
                        selectedCourseId === course.course_id ? "bg-white" : ""
                      )}
                      style={{ 
                        backgroundColor: selectedCourseId === course.course_id 
                          ? "white" 
                          : courseColor
                      }}
                    ></div>
                    <span>{course.course_code}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Sessions Cards */}
          <div className="p-4">
            <AnimatePresence>
              {filteredSessions.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
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
                        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ 
                          duration: 0.2, 
                          delay: index * 0.05
                        }}
                        whileHover={{ 
                          y: -2,
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          transition: { duration: 0.2 }
                        }}
                        onClick={(e) => {
                          // Prevent triggering if clicking the Continue button
                          if (!(e.target as HTMLElement).closest('button')) {
                            router.push(`/preparation/custom/${session.id}`)
                          }
                        }}
                      >
                        <div className="p-4">
                          {/* Course code and icon */}
                          <div className="flex items-center gap-1.5 mb-3">
                            <div className="w-4 h-4 flex-shrink-0">
                              <Icon className="w-4 h-4" style={{ color: courseColor }} />
                            </div>
                            <p className="text-xs font-medium text-gray-500">{getCourseCode(session.courseId)}</p>
                          </div>
                          
                          {/* Title */}
                          <h3 className="font-medium text-gray-900 mb-2">{session.name}</h3>
                          
                          {/* Description */}
                          {session.description && (
                            <p className="text-sm text-gray-500 mb-3">{session.description}</p>
                          )}
                          
                          {/* Last accessed time */}
                          <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span>Last accessed {formatSessionDate(session.lastAccessed)}</span>
                          </div>
                          
                          {/* Bottom section */}
                          <div className="flex justify-between items-center">
                            {/* Session type tag */}
                            <div 
                              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                              style={{ 
                                backgroundColor: `${courseColor}15`, // 15% opacity 
                                color: courseColor 
                              }}
                            >
                              <Icon className="w-3 h-3" />
                              <span>{typeLabel}</span>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex items-center gap-2">
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
                                className="px-4 py-1.5 text-white rounded text-sm font-medium"
                                style={{ backgroundColor: courseColor }}
                              >
                                Continue
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
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
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {aiInsights.map((insight, index) => {
                    const Icon = getIconComponent(insight.type === 'review' ? 'BookOpen' : 
                                                  insight.type === 'practice' ? 'Target' : 
                                                  insight.type === 'strengthen' ? 'Brain' : 'Sparkles');
                    const courseColor = getCourseColor(insight.courseId);
                    
                    return (
                      <motion.div
                        key={insight.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ 
                          duration: 0.2, 
                          delay: index * 0.05
                        }}
                        whileHover={{ 
                          y: -2,
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          transition: { duration: 0.2 }
                        }}
                        onClick={() => router.push(`/study/${insight.courseId}/${insight.topic}`)}
                      >
                        <div className="p-4">
                          {/* Priority indicator */}
                          {insight.priority && (
                            <div className="flex justify-end mb-2">
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full font-medium",
                                insight.priority === 'high' ? "bg-red-100 text-red-700" :
                                insight.priority === 'medium' ? "bg-yellow-100 text-yellow-700" :
                                "bg-green-100 text-green-700"
                              )}>
                                {insight.priority} priority
                              </span>
                            </div>
                          )}
                          
                          {/* Course code and icon */}
                          <div className="flex items-center gap-1.5 mb-3">
                            <div className="w-4 h-4 flex-shrink-0">
                              <Icon className="w-4 h-4" style={{ color: courseColor }} />
                            </div>
                            <p className="text-xs font-medium text-gray-500">{insight.courseCode}</p>
                          </div>
                          
                          {/* Title */}
                          <h3 className="font-medium text-gray-900 mb-2">{insight.title}</h3>
                          
                          {/* Description */}
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{insight.description}</p>
                          
                          {/* Duration and deadline */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span>{insight.duration} minutes</span>
                            </div>
                            {insight.deadline && (
                              <div className="flex items-center gap-1 text-xs text-amber-600">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDaysUntil(insight.deadline.dueDate)}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Bottom section */}
                          <div className="flex justify-between items-center">
                            {/* Type tag */}
                            <div 
                              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                              style={{ 
                                backgroundColor: `${courseColor}15`, // 15% opacity
                                color: courseColor 
                              }}
                            >
                              <Icon className="w-3 h-3" />
                              <span>{insight.type}</span>
                            </div>
                            
                            {/* Start button */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/study/${insight.courseId}/${insight.topic}`);
                              }}
                              className="px-4 py-1.5 text-white rounded text-sm font-medium hover:opacity-90"
                              style={{ backgroundColor: courseColor }}
                            >
                              Start
                            </button>
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