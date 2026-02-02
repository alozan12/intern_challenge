'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, getDay, setDate } from 'date-fns'
import { Deadline, Course } from '@/types'
import { cn } from '@/lib/utils'

// Mock data - in a real app, this would come from an API
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
      }
    ]
  }
]

// Get all deadlines
const allDeadlines = mockCourses.flatMap(course => 
  course.upcomingDeadlines.map(deadline => ({
    ...deadline,
    courseName: course.name,
    courseCode: course.code,
    courseColor: course.color
  }))
)

interface CalendarDayProps {
  day: Date
  currentMonth: Date
  deadlines: any[]
  onSelectDay: (day: Date) => void
  isSelected: boolean
}

function CalendarDay({ day, currentMonth, deadlines, onSelectDay, isSelected }: CalendarDayProps) {
  const dayDeadlines = deadlines.filter(deadline => 
    isSameDay(new Date(deadline.dueDate), day)
  )
  
  const isCurrentDay = isToday(day)
  const isCurrentMonth = isSameMonth(day, currentMonth)
  
  return (
    <div
      onClick={() => onSelectDay(day)}
      className={cn(
        "min-h-24 p-2 border border-gray-200 overflow-hidden",
        !isCurrentMonth && "bg-gray-50 text-gray-400",
        isCurrentDay && !isSelected && "ring-2 ring-asu-maroon ring-inset",
        isSelected && "bg-asu-maroon/10 ring-2 ring-asu-maroon ring-inset",
        "cursor-pointer hover:bg-gray-50 transition-colors"
      )}
    >
      <div className="flex justify-between items-start">
        <span className={cn(
          "font-semibold text-sm",
          isCurrentDay && "text-asu-maroon",
          isSelected && "text-asu-maroon"
        )}>
          {format(day, 'd')}
        </span>
      </div>
      
      <div className="mt-1 space-y-1 max-h-20 overflow-hidden">
        {dayDeadlines.map((deadline, idx) => (
          <div 
            key={deadline.id}
            className="text-xs p-1 rounded truncate"
            style={{ backgroundColor: `${deadline.courseColor}20` }}
          >
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: deadline.courseColor }}></div>
              <span className="truncate">{deadline.title}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface DeadlineTypeIndicatorProps {
  type: 'assignment' | 'quiz' | 'exam' | 'discussion'
}

function DeadlineTypeIndicator({ type }: DeadlineTypeIndicatorProps) {
  const typeStyles = {
    assignment: "bg-blue-100 text-blue-800",
    quiz: "bg-green-100 text-green-800",
    exam: "bg-red-100 text-red-800",
    discussion: "bg-purple-100 text-purple-800"
  }
  
  const typeLabels = {
    assignment: "Assignment",
    quiz: "Quiz",
    exam: "Exam",
    discussion: "Discussion"
  }
  
  return (
    <span className={cn("inline-block text-xs px-2 py-0.5 rounded-full font-medium", typeStyles[type])}>
      {typeLabels[type]}
    </span>
  )
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [selectedDayDeadlines, setSelectedDayDeadlines] = useState<any[]>([])
  
  // Update selected day deadlines when the selected day changes
  useEffect(() => {
    const deadlines = allDeadlines.filter(deadline => 
      isSameDay(new Date(deadline.dueDate), selectedDay)
    )
    setSelectedDayDeadlines(deadlines)
  }, [selectedDay])
  
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  
  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }
  
  const handleSelectDay = (day: Date) => {
    setSelectedDay(day)
  }
  
  return (
    <div className="px-8 py-6">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-asu-maroon hover:underline"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Academic Calendar</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousMonth}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-medium min-w-[180px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="ml-2 px-3 py-1 text-sm bg-asu-maroon text-white rounded hover:bg-asu-maroon/90 transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-7 gap-0">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="h-10 flex items-center justify-center border-b border-gray-200 font-semibold">
                {day}
              </div>
            ))}
            
            {calendarDays.map((day, i) => (
              <CalendarDay
                key={day.toString()}
                day={day}
                currentMonth={currentMonth}
                deadlines={allDeadlines}
                onSelectDay={handleSelectDay}
                isSelected={isSameDay(day, selectedDay)}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Day details */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">
          {format(selectedDay, 'EEEE, MMMM d, yyyy')}
        </h2>
        
        {selectedDayDeadlines.length > 0 ? (
          <div className="space-y-4">
            {selectedDayDeadlines.map((deadline) => (
              <div key={deadline.id} className="border-l-4 pl-3 py-2" style={{ borderColor: deadline.courseColor }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{deadline.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{deadline.courseCode} - {deadline.courseName}</p>
                  </div>
                  <DeadlineTypeIndicator type={deadline.type} />
                </div>
                <div className="mt-2 flex">
                  <button className="text-sm text-asu-maroon hover:underline mr-4">Prepare Now</button>
                  <button className="text-sm text-asu-maroon hover:underline">Add to Study Plan</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No deadlines scheduled for this day</p>
            <button className="mt-2 text-sm text-asu-maroon hover:underline">
              Create Study Session
            </button>
          </div>
        )}
      </div>
    </div>
  )
}