'use client'

import { useState } from 'react'
import { SessionHistoryTab } from './SessionHistoryTab'
import { KnowledgeBaseTab } from './KnowledgeBaseTab'
import { cn } from '@/lib/utils'
import { useViewMode } from '@/context/ViewModeContext'

interface LeftPanelProps {
  courseId: string
  deadlineId: string
}

export function LeftPanel({ courseId, deadlineId }: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'knowledge'>('knowledge')
  const { viewMode } = useViewMode()

  return (
    <div className={cn("flex flex-col h-full", viewMode === 'compact' ? 'text-sm' : '')}>
      {/* Tab Header */}
      <div className="border-b border-gray-200">
        <nav className="flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 font-medium border-b-2 transition-colors",
              viewMode === 'compact' ? 'py-2 px-2 text-xs' : 'py-3 px-4 text-sm',
              activeTab === 'history'
                ? "border-asu-maroon text-asu-maroon"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            Session History
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={cn(
              "flex-1 font-medium border-b-2 transition-colors",
              viewMode === 'compact' ? 'py-2 px-2 text-xs' : 'py-3 px-4 text-sm',
              activeTab === 'knowledge'
                ? "border-asu-maroon text-asu-maroon"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            Knowledge Base
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'history' ? (
          <SessionHistoryTab courseId={courseId} deadlineId={deadlineId} />
        ) : (
          <KnowledgeBaseTab courseId={courseId} />
        )}
      </div>
    </div>
  )
}