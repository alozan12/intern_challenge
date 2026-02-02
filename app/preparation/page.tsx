'use client'

import { useState, useRef } from 'react'
import { Course, Deadline } from '@/types'
import { ChevronRight, ChevronLeft, Clock, Calendar, Check, BookOpen, ChevronUp, ChevronDown } from 'lucide-react'
import { format, isPast, isFuture, isToday, isTomorrow, formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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

// Function to get appropriate icon for deadline type
function getDeadlineIcon(type: Deadline['type']) {
  switch (type) {
    case 'assignment':
      return '📝'
    case 'quiz':
      return '📊'
    case 'exam':
      return '📚'
    case 'discussion':
      return '💬'
  }
}

// Function to get deadline relative date label
function getDeadlineLabel(date: Date): string {
  if (isPast(date) && !isToday(date)) return formatDistanceToNow(date, { addSuffix: true })
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return formatDistanceToNow(date, { addSuffix: true })
}

interface CourseCardProps {
  course: Course
  isSelected: boolean
  onClick: () => void
}

function CourseCard({ course, isSelected, onClick }: CourseCardProps) {
  // Count upcoming deadlines (not past)
  const upcomingCount = course.upcomingDeadlines.filter(
    deadline => isFuture(deadline.dueDate) || isToday(deadline.dueDate)
  ).length
  
  return (
    <div 
      className={cn(
        "cursor-pointer flex-shrink-0 w-64 rounded-lg overflow-hidden transition-all transform duration-200",
        isSelected ? "scale-[1.03] shadow-xl" : "hover:scale-[1.03] hover:shadow-md"
      )}
      onClick={onClick}
    >
      <div className="h-2" style={{ backgroundColor: course.color }} />
      <div className={cn(
        "bg-white p-5",
        isSelected && "ring-2 ring-offset-2",
        isSelected && `ring-[${course.color}]`
      )}>
        <div className="flex flex-col h-full">
          <h3 className="text-lg font-bold text-gray-900">{course.code}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">{course.name}</p>
          
          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium text-asu-maroon">{course.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="h-1.5 rounded-full" 
                style={{ width: `${course.progress}%`, backgroundColor: course.color }}
              />
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <BookOpen className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {upcomingCount} upcoming {upcomingCount === 1 ? 'deadline' : 'deadlines'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
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
          <span className="text-xl">{getDeadlineIcon(deadline.type)}</span>
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
                {format(deadline.dueDate, 'MMM d, h:mm a')}
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
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  
  // Refs for course carousel scrolling
  const coursesContainerRef = useRef<HTMLDivElement>(null)
  
  const handleScrollLeft = () => {
    if (coursesContainerRef.current) {
      coursesContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }
  
  const handleScrollRight = () => {
    if (coursesContainerRef.current) {
      coursesContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }
  
  // Get selected course
  const selectedCourse = selectedCourseId
    ? mockCourses.find(course => course.id === selectedCourseId)
    : null

  // Prepare deadlines for display
  const getDeadlines = () => {
    if (!selectedCourse) {
      // If no course is selected, show deadlines from all courses with course info
      return mockCourses.flatMap(course => 
        course.upcomingDeadlines.map(deadline => ({
          ...deadline,
          courseName: course.name,
          courseCode: course.code,
          courseColor: course.color
        }))
      )
    }
    
    // If course is selected, just return its deadlines (with course info)
    return selectedCourse.upcomingDeadlines.map(deadline => ({
      ...deadline,
      courseName: selectedCourse.name,
      courseCode: selectedCourse.code,
      courseColor: selectedCourse.color
    }))
  }
  
  const allDeadlines = getDeadlines()
  
  // Split deadlines into upcoming and past
  const upcomingDeadlines = allDeadlines
    .filter(deadline => isFuture(deadline.dueDate) || isToday(deadline.dueDate))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  
  const pastDeadlines = allDeadlines
    .filter(deadline => isPast(deadline.dueDate) && !isToday(deadline.dueDate))
    .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())
  
  return (
    <div className="px-8 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Preparation Center</h1>
      
      {/* Course Carousel */}
      <div className="relative mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Your Courses</h2>
          <div className="flex gap-2">
            <button 
              onClick={handleScrollLeft}
              className="p-2 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-50"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleScrollRight}
              className="p-2 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-50"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div 
          ref={coursesContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mockCourses.map(course => (
            <CourseCard 
              key={course.id}
              course={course}
              isSelected={selectedCourseId === course.id}
              onClick={() => setSelectedCourseId(course.id === selectedCourseId ? null : course.id)}
            />
          ))}
        </div>
      </div>
      
      {/* Selected Course Info */}
      {selectedCourse && (
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div 
                className="w-1 h-8 rounded-full" 
                style={{ backgroundColor: selectedCourse.color }}
              />
              <h2 className="text-xl font-bold text-gray-900">{selectedCourse.code}</h2>
              <h3 className="text-lg text-gray-700">{selectedCourse.name}</h3>
            </div>
            <button 
              onClick={() => setSelectedCourseId(null)}
              className="text-sm text-gray-600 hover:text-asu-maroon hover:underline"
            >
              Show all courses
            </button>
          </div>
        </div>
      )}
      
      {/* Deadlines Section */}
      <div className="space-y-6">
        <DeadlineSection 
          title="Upcoming Deadlines" 
          deadlines={upcomingDeadlines}
          isCollapsible={false}
        />
        
        <DeadlineSection 
          title="Past Deadlines" 
          deadlines={pastDeadlines}
          isPast={true}
        />
      </div>
    </div>
  )
}