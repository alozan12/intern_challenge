'use client'

import { BookOpen } from 'lucide-react'

interface HomeworkPreviewProps {
  completed: number
  total: number
  nextTask: string
}

export function HomeworkPreview({ completed, total, nextTask }: HomeworkPreviewProps) {
  const percentage = Math.round((completed / total) * 100)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Homework</h2>
      
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-2xl font-bold text-gray-900">{completed}</span>
            <span className="text-lg text-gray-500">/{total}</span>
          </div>
          <p className="text-sm text-gray-500">{nextTask}</p>
        </div>
        
        {/* Progress circle */}
        <div className="flex items-center justify-center h-12 w-12 rounded-full border-4 border-indigo-100">
          <div className="h-full w-full rounded-full border-4 border-indigo-500 border-t-transparent animate-pulse" 
               style={{ borderWidth: '4px' }}>
          </div>
        </div>
      </div>
    </div>
  )
}