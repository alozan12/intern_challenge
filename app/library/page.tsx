'use client'

import { useState, useEffect } from 'react'
import { FileText, BookOpen, Clock, Filter, Search, Brain, Target, Lightbulb, GraduationCap, ArrowRight, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { CustomStudySession } from '@/types'
import { format, formatDistanceToNow } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { InsightsList } from '@/components/insights/InsightsList'

type ViewTab = 'sessions' | 'insights'
type IconFilter = 'all' | 'BookOpen' | 'Brain' | 'Target' | 'FileText' | 'Lightbulb' | 'GraduationCap'

export default function BackpackPage() {
  const [activeTab, setActiveTab] = useState<ViewTab>('sessions')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all')
  const [selectedIcon, setSelectedIcon] = useState<IconFilter>('all')
  const [customSessions, setCustomSessions] = useState<CustomStudySession[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
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

  // Mock AI insights for the insights tab
  const mockInsights = [
    {
      id: '1',
      title: 'Review Binary Search Trees',
      description: 'Strengthen your understanding before the upcoming project and exam.',
      duration: 20,
      type: 'Review',
      icon: 'BookOpen',
      courseId: '1',
      topic: 'Binary Search Trees'
    },
    {
      id: '2',
      title: 'Practice Integration Techniques',
      description: 'Work through integration by parts examples to strengthen your skills.',
      duration: 15,
      type: 'Practice',
      icon: 'Target',
      courseId: '2',
      topic: 'Integration'
    },
    {
      id: '3',
      title: 'Master APA Citations',
      description: 'Review in-text citations before your upcoming essay draft.',
      duration: 10,
      type: 'Review',
      icon: 'FileText',
      courseId: '3',
      topic: 'Citations'
    },
    {
      id: '4',
      title: 'Deep Dive: Molecular Orbital Theory',
      description: 'Focus on molecular orbital theory concepts you struggled with on the quiz.',
      duration: 30,
      type: 'Study Guide',
      icon: 'Brain',
      courseId: '4',
      topic: 'Molecular-Theory'
    },
    {
      id: '5',
      title: 'Lab Report Structure Review',
      description: 'Analysis of your previous lab report shows areas for improvement.',
      duration: 20,
      type: 'Concepts',
      icon: 'Lightbulb',
      courseId: '4',
      topic: 'Lab-Reports'
    },
    {
      id: '6',
      title: 'Final Exam Key Concepts',
      description: 'Based on your progress, these are the areas to focus on for the final.',
      duration: 45,
      type: 'Prep',
      icon: 'GraduationCap',
      courseId: '5',
      topic: 'Exam-Prep'
    }
  ]
  
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
                            
                            {/* Continue button */}
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
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#8C1D40]" />
              <p className="text-sm text-gray-600">
                These are AI created sessions based on your performance.
              </p>
            </div>
          </div>
          
          <div className="p-4">
            <AnimatePresence>
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {mockInsights.slice(0, 6).map((insight, index) => {
                  const Icon = getIconComponent(insight.icon || 'BookOpen');
                  const maroonColor = '#8C1D40'; // ASU Maroon
                  
                  return (
                    <motion.div
                      key={insight.id}
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
                      onClick={() => router.push(`/study/${insight.courseId}/${insight.topic}`)}
                    >
                      <div className="p-4">
                        {/* Course code and icon */}
                        <div className="flex items-center gap-1.5 mb-3">
                          <div className="w-4 h-4 flex-shrink-0">
                            <Icon className="w-4 h-4" style={{ color: maroonColor }} />
                          </div>
                          <p className="text-xs font-medium text-gray-500">{getCourseCode(insight.courseId, true)}</p>
                        </div>
                        
                        {/* Title */}
                        <h3 className="font-medium text-gray-900 mb-2">{insight.title}</h3>
                        
                        {/* Description */}
                        {insight.description && (
                          <p className="text-sm text-gray-500 mb-3">{insight.description}</p>
                        )}
                        
                        {/* Duration */}
                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span>{insight.duration || 20} minutes</span>
                        </div>
                        
                        {/* Bottom section */}
                        <div className="flex justify-between items-center">
                          {/* Type tag */}
                          <div 
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                            style={{ 
                              backgroundColor: `${maroonColor}15`, // 15% opacity
                              color: maroonColor 
                            }}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{insight.type || 'Study Guide'}</span>
                          </div>
                          
                          {/* Start button */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/study/${insight.courseId}/${insight.topic}`);
                            }}
                            className="px-4 py-1.5 text-white rounded text-sm font-medium"
                            style={{ backgroundColor: maroonColor }}
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
          </div>
        </div>
      )}
    </div>
  )
}