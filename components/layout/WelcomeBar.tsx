'use client'

import { SunMedium } from 'lucide-react'

export function WelcomeBar() {
  // Get current date for greeting
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
  const month = today.toLocaleDateString('en-US', { month: 'long' });
  const date = today.getDate();
  const formattedDate = `${dayOfWeek}, ${month} ${date}`;

  return (
    <div className="h-14 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-8 z-40">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          Good morning, Sun Devil! <SunMedium className="text-yellow-400 h-6 w-6" />
        </h1>
        <p className="text-gray-500 ml-4">{formattedDate}</p>
      </div>
    </div>
  )
}