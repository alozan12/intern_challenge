'use client'

import { useState } from 'react'
import { Clock, FileText, Brain, RotateCcw } from 'lucide-react'
import { SessionHistory } from '@/types'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface SessionHistoryTabProps {
  courseId: string
}

// Mock data - replace with API call
const mockSessions: SessionHistory[] = [
  {
    id: '1',
    courseId: '1',
    courseName: 'CSE 110',
    title: 'Binary Search Trees Study Session',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    type: 'study',
    duration: 45,
    materials: []
  },
  {
    id: '2',
    courseId: '1',
    courseName: 'CSE 110',
    title: 'Midterm Review Session',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    type: 'review',
    duration: 90,
    materials: []
  },
  {
    id: '3',
    courseId: '1',
    courseName: 'CSE 110',
    title: 'Data Structures Practice',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    type: 'practice',
    duration: 30,
    materials: []
  }
]

export function SessionHistoryTab({ courseId }: SessionHistoryTabProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  
  // Filter sessions by courseId
  const courseSessions = mockSessions.filter(session => session.courseId === courseId)

  const getSessionIcon = (type: SessionHistory['type']) => {
    switch(type) {
      case 'study':
        return <FileText className="w-4 h-4" />
      case 'practice':
        return <Brain className="w-4 h-4" />
      case 'review':
        return <RotateCcw className="w-4 h-4" />
    }
  }

  const getSessionColor = (type: SessionHistory['type']) => {
    switch(type) {
      case 'study':
        return 'text-blue-600 bg-blue-50'
      case 'practice':
        return 'text-green-600 bg-green-50'
      case 'review':
        return 'text-purple-600 bg-purple-50'
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-2">
        {courseSessions.map((session) => (
          <button
            key={session.id}
            onClick={() => setSelectedSessionId(session.id)}
            className={cn(
              "w-full text-left p-3 rounded-lg border transition-all",
              selectedSessionId === session.id
                ? "border-asu-maroon bg-red-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-md",
                getSessionColor(session.type)
              )}>
                {getSessionIcon(session.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 truncate">
                  {session.title}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{format(session.date, 'MMM d, yyyy')}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{session.duration} min</span>
                  </div>
                </div>
                {session.materials.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    {session.materials.length} study materials created
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {courseSessions.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No previous study sessions</p>
          <p className="text-xs mt-1">Your sessions will appear here</p>
        </div>
      )}
    </div>
  )
}