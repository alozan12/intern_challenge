'use client'

import Link from 'next/link'
import { CircleProgress } from '@/components/ui/CircleProgress'

interface LevelPreviewProps {
  level: string
  progress: number
  lastTested: string
}

export function LevelPreview({ level, progress, lastTested }: LevelPreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Level</h2>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-1">
          <div className="text-3xl font-bold text-gray-900">{level}</div>
          <div className="text-xs text-gray-500">Tested on {lastTested}</div>
        </div>
        
        <Link href="/analytics" className="text-xs text-blue-600 hover:underline">
          Test again
        </Link>
      </div>
      
      <div className="mt-4 flex justify-center">
        <CircleProgress 
          progress={progress} 
          size={70} 
          strokeWidth={8} 
          circleColor="#ddd"
          progressColor="#6B46C1" 
          textColor="#111"
        />
      </div>
    </div>
  )
}