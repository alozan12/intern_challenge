'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import Link from 'next/link'
import { Deadline } from '@/types'
import { cn } from '@/lib/utils'

interface MiniCalendarProps {
  deadlines: Deadline[]
}

export function MiniCalendar({ deadlines }: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  // Show only 2 weeks at a time
  // By default show first 2 weeks, or if currentDay is after first 2 weeks, show last 2 weeks
  const firstTwoWeeksEnd = new Date(monthStart)
  firstTwoWeeksEnd.setDate(firstTwoWeeksEnd.getDate() + 13) // 14 days (2 weeks) from start
  
  // Check if today is after the first 2 weeks
  const today = new Date()
  const showSecondHalf = isToday(today) && today > firstTwoWeeksEnd && isSameMonth(today, currentMonth)
  
  let periodStart, periodEnd
  if (showSecondHalf) {
    // Show the second half of the month (last 2 weeks)
    const daysInMonth = monthEnd.getDate()
    // Start from the midpoint or 2 weeks before end, whichever gives exactly 2 weeks
    periodStart = new Date(monthStart)
    periodStart.setDate(Math.max(15, daysInMonth - 13))
    periodEnd = monthEnd
  } else {
    // Show first 2 weeks
    periodStart = monthStart
    periodEnd = firstTwoWeeksEnd
  }
  
  // Get days for the 2 week period
  const days = eachDayOfInterval({ start: periodStart, end: periodEnd })

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const getDeadlinesForDay = (day: Date) => {
    return deadlines.filter(deadline => 
      isSameDay(new Date(deadline.dueDate), day)
    )
  }

  // Calculate empty days at the start of the month for proper grid alignment
  const startingDayOfWeek = monthStart.getDay()
  const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i)

  return (
    <div className="rounded-lg p-1">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-semibold text-gray-700">Calendar</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousMonth}
            className="p-0.5 hover:bg-gray-100 rounded"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <span className="text-xs font-medium min-w-[70px] text-center overflow-hidden text-ellipsis whitespace-nowrap">
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
          <div key={item.key} className="text-xs font-medium text-gray-500 text-center py-0">
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

          return (
            <Link
              key={day.toISOString()}
              href={`/calendar?date=${format(day, 'yyyy-MM-dd')}`}
              className={cn(
                "aspect-square p-0 flex flex-col items-center justify-center rounded-md transition-colors relative text-xs",
                isCurrentDay && "bg-asu-maroon text-white",
                !isCurrentDay && hasDeadlines && "bg-asu-gold/20 hover:bg-asu-gold/30",
                !isCurrentDay && !hasDeadlines && "hover:bg-gray-100",
                !isSameMonth(day, currentMonth) && "text-gray-300"
              )}
            >
              <span className="text-xs font-medium">{format(day, 'd')}</span>
              {hasDeadlines && (
                <div className="flex gap-0.5 mt-0">
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
          className="text-[0.65rem] text-asu-maroon hover:underline flex items-center justify-center gap-0.5"
        >
          View full calendar
          <ArrowRight className="w-2 h-2" />
        </Link>
      </div>
    </div>
  )
}