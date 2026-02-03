'use client'

import { Flame, CalendarDays } from 'lucide-react'

interface ActivityStreakProps {
  daysInARow: number
}

export function ActivityStreak({ daysInARow }: ActivityStreakProps) {
  // Generate the weekday circles
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = new Date().getDay() // 0 is Sunday, 1 is Monday, etc.
  const adjustedToday = today === 0 ? 6 : today - 1 // Convert to 0 = Monday, 6 = Sunday

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-[#f9e5e5] rounded-md">
            <CalendarDays className="w-5 h-5 text-[#8C1D40]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Activity</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-[#FFF8E8] text-[#8C1D40] px-2.5 py-1 rounded-full text-sm font-medium">
          <Flame className="h-4 w-4 text-[#FFC627]" />
          <span>{daysInARow} days in row!</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        {weekdays.map((day, index) => {
          // Determine if this day should be active (has activity)
          const isActive = index <= adjustedToday
          
          return (
            <div key={day} className="flex flex-col items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${
                index === adjustedToday
                  ? 'bg-[#8C1D40] text-white ring-2 ring-offset-2 ring-[#8C1D40]/30' 
                  : isActive 
                    ? 'bg-[#8C1D40] text-white' 
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {index + 1}
              </div>
              <span className="text-xs text-gray-500 mt-1">{day}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}