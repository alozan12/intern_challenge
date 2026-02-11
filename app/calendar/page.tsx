'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import { cn } from '@/lib/utils'
import { DeadlineDetailsModal } from '@/components/calendar/DeadlineDetailsModal'

// We'll use a function to generate random colors for courses based on their ID
function getRandomColor(courseId: string) {
  // Predefined ASU colors
  const colors = [
    '#8C1D40', // ASU Maroon
    '#FF6900', // ASU Orange
    '#00A3E0', // ASU Blue
    '#78BE20', // ASU Green
    '#6B46C1', // Purple
    '#1E429F', // Navy
    '#9B2FAE'  // Pink
  ];
  
  // Use the courseId to select a color deterministically
  const colorIndex = parseInt(courseId) % colors.length;
  return colors[colorIndex];
}

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
  
  // Function to handle clicking on a deadline
  const handleDeadlineClick = (e: React.MouseEvent, deadline: any) => {
    e.stopPropagation() // Prevent day selection
    // Dispatch a custom event to open the deadline details
    window.dispatchEvent(new CustomEvent('openDeadlineDetails', { detail: deadline }))
  }
  
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
        {dayDeadlines.map((deadline) => (
          <div 
            key={deadline.id}
            onClick={(e) => handleDeadlineClick(e, deadline)}
            className="text-xs p-1 rounded truncate block hover:bg-gray-100 transition-colors cursor-pointer"
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
  const [deadlines, setDeadlines] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDeadline, setSelectedDeadline] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch courses and deadlines
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const coursesResponse = await fetch('/api/courses');
        const coursesData = await coursesResponse.json();
        
        if (coursesData.success && coursesData.courses?.length > 0) {
          // Map courses to the format we need
          const formattedCourses = coursesData.courses.map((course: any) => ({
            id: course.course_id,
            name: course.course_name,
            code: course.course_code,
            color: getRandomColor(course.course_id),
            term: course.term
          }));
          
          setCourses(formattedCourses);
          
          // Fetch deadlines
          const deadlinesResponse = await fetch('/api/deadlines');
          const deadlinesData = await deadlinesResponse.json();
          
          if (deadlinesData.success) {
            // Process the deadlines and add course info
            const processedDeadlines = deadlinesData.deadlines.map((deadline: any) => {
              const course = formattedCourses.find((c: any) => c.id === deadline.courseId);
              return {
                ...deadline,
                dueDate: new Date(deadline.dueDate),
                courseName: course?.name || 'Unknown Course',
                courseCode: course?.code || 'Unknown',
                courseColor: course?.color || '#8C1D40'
              };
            });
            
            setDeadlines(processedDeadlines);
            
            // Update selected day deadlines
            const dayDeadlines = processedDeadlines.filter((deadline: any) => 
              isSameDay(new Date(deadline.dueDate), selectedDay)
            );
            setSelectedDayDeadlines(dayDeadlines);
          } else {
            setError('Failed to fetch deadlines');
          }
        } else {
          setError('Failed to fetch courses');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Update selected day deadlines when the selected day changes
  useEffect(() => {
    if (deadlines.length > 0) {
      const filteredDeadlines = deadlines.filter(deadline => 
        isSameDay(new Date(deadline.dueDate), selectedDay)
      );
      setSelectedDayDeadlines(filteredDeadlines);
    }
  }, [selectedDay, deadlines])
  
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
  
  // Handle opening the deadline details modal
  const openDeadlineDetails = (deadline: any) => {
    setSelectedDeadline(deadline)
    setIsModalOpen(true)
  }
  
  // Handle closing the deadline details modal
  const closeDeadlineDetails = () => {
    setIsModalOpen(false)
    // Wait a bit before removing the deadline data to allow for smooth animation
    setTimeout(() => setSelectedDeadline(null), 200)
  }
  
  // Listen for custom event to open deadline details
  useEffect(() => {
    const handleOpenDeadlineDetails = (e: Event) => {
      const customEvent = e as CustomEvent
      openDeadlineDetails(customEvent.detail)
    }
    
    window.addEventListener('openDeadlineDetails', handleOpenDeadlineDetails)
    return () => {
      window.removeEventListener('openDeadlineDetails', handleOpenDeadlineDetails)
    }
  }, [])
  
  if (isLoading) {
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
        
        <div className="bg-white rounded-lg shadow-md p-8 h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-asu-maroon mb-4"></div>
            <p className="text-gray-600">Loading your calendar...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
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
        
        <div className="bg-white rounded-lg shadow-md p-8 h-96 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 font-medium mb-2">{error}</p>
            <p className="text-gray-500">Please try again later or contact support.</p>
          </div>
        </div>
      </div>
    );
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
            
            {calendarDays.map((day) => (
              <CalendarDay
                key={day.toString()}
                day={day}
                currentMonth={currentMonth}
                deadlines={deadlines}
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
                  <button 
                    onClick={() => openDeadlineDetails(deadline)}
                    className="text-sm text-asu-maroon hover:underline mr-4 flex items-center"
                  >
                    View Details
                  </button>
                  <Link 
                    href={`/preparation/${deadline.courseId}/${deadline.id}`}
                    className="text-sm text-asu-maroon hover:underline mr-4 flex items-center"
                  >
                    Prepare Now
                  </Link>
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
      
      {/* Deadline details modal */}
      <DeadlineDetailsModal 
        deadline={selectedDeadline} 
        isOpen={isModalOpen} 
        onClose={closeDeadlineDetails} 
      />
    </div>
  )
}