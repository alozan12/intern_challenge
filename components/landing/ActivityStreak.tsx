'use client'

import { Flame, CalendarDays } from 'lucide-react'

interface ActivityStreakProps {
  daysInARow: number
}

export function ActivityStreak({ daysInARow }: ActivityStreakProps) {
  // Limit to just weekdays Mon-Sat (6 days) for better fit
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date().getDay() // 0 is Sunday, 1 is Monday, etc.
  const adjustedToday = today === 0 ? 5 : Math.min(today - 1, 5) // Convert to 0 = Monday, 5 = Saturday

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-0 h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-[#8C1D40]" />
          <h2 className="text-lg font-semibold text-gray-900">Activity</h2>
        </div>
      </div>
      
      <div className="flex flex-col flex-grow">
        <div className="flex items-center justify-center gap-1.5 bg-[#FFF8E8] text-[#8C1D40] px-3 py-1 rounded-full text-sm font-medium mx-auto mt-2 mb-2">
          <Flame className="h-4 w-4 text-[#FFC627]" />
          <span>{daysInARow} days in row!</span>
        </div>
        
        <div className="flex justify-around items-center px-2 pb-3">
          {weekdays.map((day, index) => {
            // Determine if this day should be active (has activity)
            const isActive = index <= adjustedToday
            
            return (
              <div key={day} className="flex flex-col items-center">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium ${
                  index === adjustedToday
                    ? 'bg-[#8C1D40] text-white ring-1 ring-[#8C1D40]/30' 
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
    </div>
  )
}