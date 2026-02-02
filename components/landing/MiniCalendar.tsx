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
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

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

  const startingDayOfWeek = monthStart.getDay()
  const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i)

  return (
    <div className="bg-white rounded-lg card-shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousMonth}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium min-w-[100px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
          <div key={day} className="text-xs font-medium text-gray-500 text-center py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
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
                "aspect-square p-1 flex flex-col items-center justify-center rounded-md transition-colors relative",
                isCurrentDay && "bg-asu-maroon text-white",
                !isCurrentDay && hasDeadlines && "bg-asu-gold/20 hover:bg-asu-gold/30",
                !isCurrentDay && !hasDeadlines && "hover:bg-gray-100",
                !isSameMonth(day, currentMonth) && "text-gray-300"
              )}
            >
              <span className="text-sm">{format(day, 'd')}</span>
              {hasDeadlines && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayDeadlines.slice(0, 3).map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "w-1 h-1 rounded-full",
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

      <div className="mt-4 pt-4 border-t border-gray-100">
        <Link 
          href="/calendar" 
          className="text-sm text-asu-maroon hover:underline flex items-center justify-center gap-1"
        >
          View full calendar
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}