'use client'

import { useState } from 'react'
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns'
import Link from 'next/link'
import { Course, Deadline } from '@/types'
import { ArrowRight, Calendar, Clock, Search, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeadlinesSectionProps {
  courses: Course[]
}

// Helper function to get appropriate icon based on deadline type
function getDeadlineTypeColor(type: Deadline['type']): string {
  switch (type) {
    case 'assignment':
      return 'bg-blue-100 text-blue-700'
    case 'quiz':
      return 'bg-green-100 text-green-700'
    case 'exam':
      return 'bg-red-100 text-red-700'
    case 'discussion':
      return 'bg-purple-100 text-purple-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function getDeadlineLabel(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return formatDistanceToNow(date, { addSuffix: true })
}

export function DeadlinesSection({ courses }: DeadlinesSectionProps) {
  // Extract all deadlines from all courses
  const allDeadlines = courses.flatMap(course => 
    course.upcomingDeadlines.map(deadline => ({
      ...deadline,
      courseName: course.name,
      courseCode: course.code,
      courseColor: course.color
    }))
  ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<string | 'all'>('all')
  const [selectedType, setSelectedType] = useState<Deadline['type'] | 'all'>('all')
  
  // Filter deadlines based on current filters
  const filteredDeadlines = allDeadlines.filter(deadline => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      deadline.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deadline.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deadline.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Course filter
    const matchesCourse = selectedCourse === 'all' || deadline.courseId === selectedCourse;
    
    // Type filter
    const matchesType = selectedType === 'all' || deadline.type === selectedType;
    
    return matchesSearch && matchesCourse && matchesType;
  });

  // Get unique list of courses for dropdown
  const uniqueCourses = courses.map(course => ({
    id: course.id,
    name: course.name,
    code: course.code
  }));
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Filters section */}
      <div className="p-3 border-b border-gray-250">
        <div className="flex flex-col gap-2">
          {/* Search input */}
          <div className="w-full relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
              <Search className="w-3 h-3 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deadlines..."
              className="w-full pl-8 pr-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-asu-maroon/50 focus:border-asu-maroon"
            />
          </div>
          
          {/* Filters dropdown */}
          <div className="flex flex-wrap items-center gap-1 justify-between">
            {/* Course filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="course-filter" className="text-xs font-medium text-gray-700 whitespace-nowrap">Course:</label>
              <select
                id="course-filter"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value === 'all' ? 'all' : e.target.value)}
                className="border border-gray-300 rounded-md py-0.5 pl-1 pr-6 text-xs focus:outline-none focus:ring-1 focus:ring-asu-maroon/50 focus:border-asu-maroon"
              >
                <option value="all">All Courses</option>
                {uniqueCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Type filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="type-filter" className="text-xs font-medium text-gray-700 whitespace-nowrap">Type:</label>
              <select
                id="type-filter"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value === 'all' ? 'all' : e.target.value as Deadline['type'])}
                className="border border-gray-300 rounded-md py-0.5 pl-1 pr-6 text-xs focus:outline-none focus:ring-1 focus:ring-asu-maroon/50 focus:border-asu-maroon"
              >
                <option value="all">All Types</option>
                <option value="assignment">Assignments</option>
                <option value="quiz">Quizzes</option>
                <option value="exam">Exams</option>
                <option value="discussion">Discussions</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Deadlines list */}
      <div className="divide-y divide-gray-100 max-h-[180px] overflow-y-auto scrollbar-thin">
        {filteredDeadlines.length > 0 ? (
          filteredDeadlines.map((deadline) => (
            <div key={deadline.id} className="p-2 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-4 flex-1">
                  {/* Course indicator */}
                  <div 
                    className="w-2 h-10 rounded-full" 
                    style={{ backgroundColor: deadline.courseColor }}
                  ></div>
                  
                  <div className="flex-1">
                    {/* Deadline title and course */}
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <p className="font-medium text-gray-900 text-sm">{deadline.title}</p>
                      <span className={cn(
                        "px-2 py-0.5 text-xs font-medium rounded-full",
                        getDeadlineTypeColor(deadline.type)
                      )}>
                        {deadline.type.charAt(0).toUpperCase() + deadline.type.slice(1)}
                      </span>
                    </div>
                    
                    {/* Course code */}
                    <p className="text-xs text-gray-600 mb-1">{deadline.courseCode} - {deadline.courseName}</p>
                    
                    {/* Due date */}
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{getDeadlineLabel(deadline.dueDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span suppressHydrationWarning>{format(deadline.dueDate, 'MMM d, h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Prepare button */}
                <Link 
                  href={`/preparation/${deadline.courseId}/${deadline.id}`}
                  className="px-2 py-1 bg-asu-maroon text-white rounded-md text-xs flex items-center gap-1 hover:bg-asu-maroon/90"
                >
                  Prepare
                  <ArrowRight className="w-2 h-2" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">No deadlines found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}