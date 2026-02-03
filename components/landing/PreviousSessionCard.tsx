'use client'

import { History, ArrowRight, BookOpen, HelpCircle, MessageSquare, CheckSquare, Clock } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { CircleProgress } from '@/components/ui/CircleProgress'

interface PreviousSessionCardProps {
  level: string
  progress: number
  lastTested: string
  sessionId?: string
}

export function PreviousSessionCard({ 
  level, 
  progress, 
  lastTested,
  sessionId = "last-session"
}: PreviousSessionCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-0 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#8C1D40]" />
          <h2 className="text-lg font-semibold text-gray-900">Previous Session</h2>
        </div>
        <Link 
          href="/history"
          className="text-sm text-[#8C1D40] hover:underline"
        >
          View History
        </Link>
      </div>
      
      <div className="px-4 pt-2 pb-1">
        {/* Main content */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">Exam 2</h3>
            {/* Time spent studying */}
            <div className="bg-[#f9e5e5] text-[#8C1D40] px-2 py-0.5 rounded-md">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="font-medium text-sm">1.5 hrs</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-sm">CSE 110</p>
        </div>
      </div>
      
      {/* Continue button in a contained section */}
      <div className="bg-gray-50 p-2 mt-auto">
        <Link 
          href={`/preparation/session/${sessionId}`}
          className="flex items-center justify-center w-full px-3 py-1.5 bg-[#8C1D40] text-white rounded-md text-center text-sm font-medium"
        >
          Continue Session
        </Link>
      </div>
    </div>
  )
}