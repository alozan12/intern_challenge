'use client'

import { useState } from 'react'
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns'
import Link from 'next/link'
import { Course, Deadline } from '@/types'
import { ArrowRight, Calendar, Clock, Search, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeadlinesSectionProps {
  courses: Course[]
  showTitle?: boolean
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

export function DeadlinesSection({ courses, showTitle = true }: DeadlinesSectionProps) {
  // Extract all deadlines from all courses and sort by due date
  const allDeadlines = courses.flatMap(course => 
    course.upcomingDeadlines.map(deadline => ({
      ...deadline,
      courseName: course.name,
      courseCode: course.code,
      courseColor: course.color
    }))
  ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  
  // Show all deadlines without filtering
  const filteredDeadlines = allDeadlines;
  
  return (
    <div className={showTitle ? "bg-white rounded-lg shadow-sm border border-gray-200" : ""}>
      {showTitle && (
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h2>
        </div>
      )}
      {/* View All link */}
      <div className="px-4 py-2 border-b border-gray-200 flex justify-end">
        <Link 
          href="/preparation"
          className="text-xs text-asu-maroon hover:underline flex items-center gap-1"
        >
          View All
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      
      {/* Deadlines list */}
      <div className="divide-y divide-gray-100 max-h-[380px] overflow-y-auto scrollbar-thin">
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