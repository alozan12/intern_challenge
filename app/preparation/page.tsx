'use client'

import { useState, useEffect } from 'react'
import { Course, Deadline } from '@/types'
import { ChevronRight, Clock, Calendar, Check, ChevronUp, ChevronDown, FileText, FileQuestion, BookOpen, MessageSquare } from 'lucide-react'
import { format, isPast, isFuture, isToday, isTomorrow, formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

// Mock data with additional past deadlines for demonstration
const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Introduction to Computer Science',
    code: 'CSE 110',
    color: '#8C1D40',
    progress: 78,
    upcomingDeadlines: [
      {
        id: '1',
        title: 'Project 3: Binary Search Trees',
        type: 'assignment',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        courseId: '1'
      },
      {
        id: '2',
        title: 'Midterm Exam',
        type: 'exam',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        courseId: '1'
      },
      // Past deadlines
      {
        id: '11',
        title: 'Project 1: Introduction to Programming',
        type: 'assignment',
        dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        courseId: '1'
      },
      {
        id: '12',
        title: 'Project 2: Data Structures',
        type: 'assignment',
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        courseId: '1'
      },
      {
        id: '13',
        title: 'Quiz 1: Programming Basics',
        type: 'quiz',
        dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        courseId: '1'
      }
    ]
  },
  {
    id: '2',
    name: 'Calculus I',
    code: 'MAT 265',
    color: '#FF6900',
    progress: 65,
    upcomingDeadlines: [
      {
        id: '3',
        title: 'Chapter 5 Quiz',
        type: 'quiz',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        courseId: '2'
      },
      // Past deadlines
      {
        id: '21',
        title: 'Chapter 1 Homework',
        type: 'assignment',
        dueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
        courseId: '2'
      },
      {
        id: '22',
        title: 'Chapter 2 Quiz',
        type: 'quiz',
        dueDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
        courseId: '2'
      },
      {
        id: '23',
        title: 'Chapter 3 Quiz',
        type: 'quiz',
        dueDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        courseId: '2'
      },
      {
        id: '24',
        title: 'Chapter 4 Homework',
        type: 'assignment',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        courseId: '2'
      }
    ]
  },
  {
    id: '3',
    name: 'English Composition',
    code: 'ENG 101',
    color: '#00A3E0',
    progress: 82,
    upcomingDeadlines: [
      {
        id: '4',
        title: 'Essay Draft',
        type: 'assignment',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        courseId: '3'
      },
      {
        id: '5',
        title: 'Peer Review',
        type: 'discussion',
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        courseId: '3'
      },
      // Past deadlines
      {
        id: '31',
        title: 'Reading Response 1',
        type: 'assignment',
        dueDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
        courseId: '3'
      },
      {
        id: '32',
        title: 'Reading Response 2',
        type: 'assignment',
        dueDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        courseId: '3'
      }
    ]
  },
  {
    id: '4',
    name: 'General Chemistry',
    code: 'CHM 113',
    color: '#78BE20',
    progress: 71,
    upcomingDeadlines: [
      {
        id: '6',
        title: 'Lab Report 4',
        type: 'assignment',
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        courseId: '4'
      },
      // Past deadlines
      {
        id: '41',
        title: 'Lab Report 1',
        type: 'assignment',
        dueDate: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000), // 24 days ago
        courseId: '4'
      },
      {
        id: '42',
        title: 'Lab Report 2',
        type: 'assignment',
        dueDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000), // 17 days ago
        courseId: '4'
      },
      {
        id: '43',
        title: 'Lab Report 3',
        type: 'assignment',
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        courseId: '4'
      }
    ]
  },
  {
    id: '5',
    name: 'Introduction to Psychology',
    code: 'PSY 101',
    color: '#6B46C1',
    progress: 88,
    upcomingDeadlines: [
      {
        id: '7',
        title: 'Final Project',
        type: 'assignment',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        courseId: '5'
      },
      // Past deadlines
      {
        id: '51',
        title: 'Behavioral Analysis Paper',
        type: 'assignment',
        dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        courseId: '5'
      },
      {
        id: '52',
        title: 'Midterm Exam',
        type: 'exam',
        dueDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        courseId: '5'
      }
    ]
  }
]

// Function to get appropriate icon component for deadline type
function getDeadlineIcon(type: Deadline['type']) {
  switch (type) {
    case 'assignment':
      return FileText
    case 'quiz':
      return FileQuestion
    case 'exam':
      return BookOpen
    case 'discussion':
      return MessageSquare
    default:
      return FileText
  }
}

// Function to get deadline relative date label
function getDeadlineLabel(date: Date): string {
  if (isPast(date) && !isToday(date)) return formatDistanceToNow(date, { addSuffix: true })
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return formatDistanceToNow(date, { addSuffix: true })
}

interface DeadlineItemProps {
  deadline: Deadline & { courseName?: string, courseCode?: string, courseColor?: string }
  isPast?: boolean
}

function DeadlineItem({ deadline, isPast = false }: DeadlineItemProps) {
  return (
    <div className={cn(
      "p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors",
      isPast && "opacity-80"
    )}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-gray-100 flex-shrink-0">
          {(() => {
            const Icon = getDeadlineIcon(deadline.type);
            return <Icon className="w-5 h-5 text-gray-700" />;
          })()}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-gray-900">{deadline.title}</p>
              {deadline.courseCode && (
                <p className="text-sm text-gray-600">{deadline.courseCode} - {deadline.courseName}</p>
              )}
            </div>
            
            <span className={cn(
              "px-2 py-0.5 rounded text-xs font-medium",
              deadline.type === 'assignment' && "bg-blue-100 text-blue-800",
              deadline.type === 'quiz' && "bg-green-100 text-green-800",
              deadline.type === 'exam' && "bg-red-100 text-red-800",
              deadline.type === 'discussion' && "bg-purple-100 text-purple-800"
            )}>
              {deadline.type.charAt(0).toUpperCase() + deadline.type.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className={cn(
                isPast ? "text-gray-500" : "text-gray-700"
              )}>
                {getDeadlineLabel(deadline.dueDate)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gray-500" />
              <span className={cn(
                isPast ? "text-gray-500" : "text-gray-700"
              )}>
                <span suppressHydrationWarning>{format(deadline.dueDate, 'MMM d, h:mm a')}</span>
              </span>
            </div>
            {isPast && (
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" />
                <span className="text-green-600">Completed</span>
              </div>
            )}
          </div>
          <div className="mt-3">
            <Link
              href={`/preparation/${deadline.courseId}/${deadline.id}`}
              className={cn(
                "px-3 py-1 text-sm rounded-md inline-flex items-center gap-1",
                !isPast 
                  ? "bg-asu-maroon text-white hover:bg-asu-maroon/90" 
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
            >
              {isPast ? "Review" : "Prepare"}
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

interface DeadlineSectionProps {
  title: string
  deadlines: (Deadline & { courseName?: string, courseCode?: string, courseColor?: string })[]
  isPast?: boolean
  isCollapsible?: boolean
}

function DeadlineSection({ title, deadlines, isPast = false, isCollapsible = true }: DeadlineSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  if (deadlines.length === 0) {
    return (
      <div className="bg-white rounded-lg overflow-hidden shadow-md mb-6">
        <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-500">No deadlines to display</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md mb-6">
      <div 
        className={cn(
          "bg-gray-50 px-4 py-3 flex justify-between items-center",
          isCollapsible && "cursor-pointer hover:bg-gray-100"
        )}
        onClick={() => isCollapsible && setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        {isCollapsible && (
          <button className="p-1 rounded-full hover:bg-gray-200">
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        )}
      </div>
      
      {!isCollapsed && (
        <div className="divide-y divide-gray-100">
          {deadlines.map(deadline => (
            <DeadlineItem
              key={deadline.id}
              deadline={deadline}
              isPast={isPast}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PreparationPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(mockCourses[0].id);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  
  // Get selected course
  const selectedCourse = mockCourses.find(course => course.id === selectedCourseId) || mockCourses[0];

  // Prepare deadlines for display
  const getDeadlines = () => {
    // Only show deadlines for the selected course
    return selectedCourse.upcomingDeadlines.map(deadline => ({
      ...deadline,
      courseName: selectedCourse.name,
      courseCode: selectedCourse.code,
      courseColor: selectedCourse.color
    }));
  };
  
  const allDeadlines = getDeadlines();
  
  // Apply document type filter if selected
  const filteredDeadlines = selectedFilter 
    ? allDeadlines.filter(deadline => deadline.type === selectedFilter)
    : allDeadlines;

  // Split deadlines into upcoming and past
  const upcomingDeadlines = filteredDeadlines
    .filter(deadline => isFuture(deadline.dueDate) || isToday(deadline.dueDate))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  
  const pastDeadlines = filteredDeadlines
    .filter(deadline => isPast(deadline.dueDate) && !isToday(deadline.dueDate))
    .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());
    
  // Get counts for each deadline type
  const getTypeCount = (type: string) => {
    return allDeadlines.filter(deadline => deadline.type === type).length;
  };
  
  const filterOptions = [
    { value: 'assignment', label: 'Assignments', count: getTypeCount('assignment') },
    { value: 'quiz', label: 'Quizzes', count: getTypeCount('quiz') },
    { value: 'exam', label: 'Exams', count: getTypeCount('exam') },
    { value: 'discussion', label: 'Discussions', count: getTypeCount('discussion') }
  ];

  return (
    <div className="px-8 py-6">
      {/* Course Tabs */}
      <div className="relative mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-[#FFC627] rounded-sm"></div>
            <h2 className="text-xl font-semibold text-gray-800">Your Courses</h2>
          </div>
        </div>
        
        <div className="bg-white rounded-lg overflow-hidden shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {mockCourses.map(course => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={cn(
                    "px-6 py-3 font-medium text-sm whitespace-nowrap focus:outline-none transition-all duration-300",
                    selectedCourseId === course.id 
                      ? "border-b-2 text-gray-900 bg-gray-50" 
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  )}
                  style={{ 
                    borderColor: selectedCourseId === course.id ? course.color : 'transparent',
                    borderBottomWidth: selectedCourseId === course.id ? '3px' : '0',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: course.color }}
                    />
                    {course.code}
                    {selectedCourseId === course.id && (
                      <motion.div 
                        layoutId="tab-highlight"
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ backgroundColor: course.color, height: '3px' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedCourseId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-1 h-8 rounded-full" 
                      style={{ backgroundColor: selectedCourse.color }}
                    />
                    <h2 className="text-xl font-bold text-gray-900">{selectedCourse.name}</h2>
                  </div>
                  
                  {/* Deadline Type Filter */}
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <h3 className="text-sm font-semibold text-gray-600 mr-2">Filter:</h3>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedFilter(null)}
                        className={cn(
                          "px-3 py-1.5 text-sm transition-colors rounded-md",
                          selectedFilter === null
                            ? "bg-asu-maroon text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        All
                      </button>
                      
                      {filterOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => setSelectedFilter(option.value)}
                          className={cn(
                            "px-3 py-1.5 text-sm transition-colors rounded-md",
                            selectedFilter === option.value
                              ? "bg-asu-maroon text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
      
            {/* Deadlines Section */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedCourseId + "-deadlines"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="space-y-6">
                <DeadlineSection 
                  title={selectedFilter 
                    ? `Upcoming ${filterOptions.find(opt => opt.value === selectedFilter)?.label || ''}` 
                    : "Upcoming Deadlines"} 
                  deadlines={upcomingDeadlines}
                  isCollapsible={false}
                />
                
                <DeadlineSection 
                  title={selectedFilter 
                    ? `Past ${filterOptions.find(opt => opt.value === selectedFilter)?.label || ''}` 
                    : "Past Deadlines"} 
                  deadlines={pastDeadlines}
                  isPast={true}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}