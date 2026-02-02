'use client'

import { useState } from 'react'
import { Clock, Calendar, ArrowRight, ChevronDown, BookOpen, FileText, ClipboardList, GraduationCap, MessageSquare } from 'lucide-react'
import { format, formatDistanceToNow, isToday, isTomorrow, isWithinInterval, addDays } from 'date-fns'
import Link from 'next/link'
import { Course, Deadline } from '@/types'
import { cn } from '@/lib/utils'

interface CourseCardProps {
  course: Course
}

function getDeadlineIcon(type: Deadline['type']) {
  switch (type) {
    case 'assignment':
      return FileText
    case 'quiz':
      return ClipboardList
    case 'exam':
      return GraduationCap
    case 'discussion':
      return MessageSquare
  }
}

function getDeadlineLabel(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return formatDistanceToNow(date, { addSuffix: true })
}

export function CourseCard({ course }: CourseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Filter deadlines for next 7 days
  const sevenDaysFromNow = addDays(new Date(), 7)
  const upcomingDeadlines = course.upcomingDeadlines.filter(deadline => 
    isWithinInterval(new Date(deadline.dueDate), {
      start: new Date(),
      end: sevenDaysFromNow
    })
  )

  const hasDeadlines = upcomingDeadlines.length > 0

  return (
    <div className="bg-white rounded-lg card-shadow overflow-hidden">
      <div 
        className="h-1" 
        style={{ backgroundColor: course.color }}
      />
      
      {/* Course Header Row */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
        type="button"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <ChevronDown className={cn(
                "w-5 h-5 text-gray-600 transition-transform duration-300",
                isExpanded && "rotate-180"
              )} />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">{course.code}</h3>
                <p className="text-sm text-gray-600">{course.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-auto mr-8">
              <BookOpen className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {hasDeadlines 
                  ? `${upcomingDeadlines.length} deadline${upcomingDeadlines.length > 1 ? 's' : ''} this week`
                  : 'No deadlines this week'
                }
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-gray-500">Progress</div>
              <div className="text-lg font-semibold text-asu-maroon">{course.progress}%</div>
            </div>
          </div>
        </div>
      </button>

      {/* Expanded Deadlines with Animation */}
      <div 
        className={cn(
          "border-t border-gray-100 overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
          {hasDeadlines ? (
            <div className="divide-y divide-gray-100 bg-white">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-gray-200 rounded-lg">
                        {(() => {
                          const Icon = getDeadlineIcon(deadline.type)
                          return <Icon className="w-5 h-5 text-gray-700" />
                        })()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{deadline.title}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{getDeadlineLabel(deadline.dueDate)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{format(deadline.dueDate, 'MMM d, h:mm a')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/preparation/${course.id}/${deadline.id}`}
                      className="btn-primary flex items-center gap-2 text-sm"
                    >
                      Prepare
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
              
              <div className="p-3 text-center bg-white">
                <Link 
                  href={`/courses/${course.id}/deadlines`}
                  className="text-sm text-asu-maroon hover:underline"
                >
                  See all deadlines for {course.code} →
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-gray-50">
              <p className="text-sm text-gray-500 mb-2">No upcoming deadlines in the next 7 days</p>
              <Link 
                href={`/courses/${course.id}/deadlines`}
                className="text-sm text-asu-maroon hover:underline"
              >
                View all course deadlines →
              </Link>
            </div>
          )}
      </div>
    </div>
  )
}