'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import Link from 'next/link'
import { Deadline } from '@/types'
import { cn } from '@/lib/utils'

interface MiniCalendarProps {
  deadlines?: Deadline[]
  useLiveData?: boolean
}

export function MiniCalendar({ deadlines = [], useLiveData = true }: MiniCalendarProps) {
  const [liveDeadlines, setLiveDeadlines] = useState<any[]>([])
  const [, setIsLoading] = useState(useLiveData)

  useEffect(() => {
    if (useLiveData) {
      const fetchDeadlines = async () => {
        try {
          const response = await fetch('/api/deadlines')
          const data = await response.json()
          
          if (data.success && data.deadlines) {
            const processedDeadlines = data.deadlines.map((deadline: any) => ({
              ...deadline,
              dueDate: deadline.dueDate ? new Date(deadline.dueDate) : new Date()
            }))
            
            setLiveDeadlines(processedDeadlines)
          }
        } catch (err) {
          console.error('Error fetching deadlines for calendar:', err)
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchDeadlines()
    }
  }, [useLiveData])
  
  const displayDeadlines = useLiveData ? liveDeadlines : deadlines
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  
  // Get all days for the full month
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const getDeadlinesForDay = (day: Date) => {
    return displayDeadlines.filter(deadline => 
      isSameDay(new Date(deadline.dueDate), day)
    )
  }

  // Calculate empty days at the start of the month for proper grid alignment
  const startingDayOfWeek = monthStart.getDay()
  const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i)

  return (
    <div className="rounded-lg p-1">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-gray-700">Calendar</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousMonth}
            className="p-0.5 hover:bg-gray-100 rounded"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <span className="text-sm font-medium min-w-[70px] text-center overflow-hidden text-ellipsis whitespace-nowrap">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-0.5 hover:bg-gray-100 rounded"
            aria-label="Next month"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0 mb-0.5">
        {[
          { day: 'S', key: 'sun' }, 
          { day: 'M', key: 'mon' }, 
          { day: 'T', key: 'tue' }, 
          { day: 'W', key: 'wed' }, 
          { day: 'T', key: 'thu' }, 
          { day: 'F', key: 'fri' }, 
          { day: 'S', key: 'sat' }
        ].map((item) => (
          <div key={item.key} className="text-sm font-medium text-gray-500 text-center py-0">
            {item.day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0">  
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const dayDeadlines = getDeadlinesForDay(day)
          const hasDeadlines = dayDeadlines.length > 0
          const isCurrentDay = isToday(day)

          // Always link to the calendar page with date parameter
          return (
            <Link
              key={day.toISOString()}
              href={`/calendar?date=${format(day, 'yyyy-MM-dd')}`}
              className={cn(
                "aspect-square p-0 flex items-center justify-center rounded-md transition-colors relative text-sm",
                isCurrentDay && "bg-asu-maroon text-white",
                !isCurrentDay && hasDeadlines && "bg-asu-gold/20 hover:bg-asu-gold/30",
                !isCurrentDay && !hasDeadlines && "hover:bg-gray-100",
                !isSameMonth(day, currentMonth) && "text-gray-300"
              )}
              title={hasDeadlines ? `${dayDeadlines.length} deadline(s): ${dayDeadlines.map(d => d.title).join(', ')}` : undefined}
            >
              <span className="text-sm font-medium">{format(day, 'd')}</span>
              {hasDeadlines && (
                <div className="absolute bottom-0.5 left-0 right-0 flex justify-center gap-0.5">
                  {dayDeadlines.slice(0, 3).map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "w-0.5 h-0.5 rounded-full",
                        isCurrentDay ? "bg-white" : "bg-asu-maroon"
                      )}
                    />
                  ))}
                </div>
              )}  
            </Link>
          )
        })}
      </div>

      <div className="mt-0.5 pt-0.5 border-t border-gray-100 text-center">
        <Link 
          href="/calendar" 
          className="text-xs text-asu-maroon hover:underline flex items-center justify-center gap-0.5"
        >
          View full calendar
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}