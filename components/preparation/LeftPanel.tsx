'use client'

import { useState } from 'react'
import { SessionHistoryTab } from './SessionHistoryTab'
import { KnowledgeBaseTab } from './KnowledgeBaseTab'
import { cn } from '@/lib/utils'

interface LeftPanelProps {
  courseId: string
}

export function LeftPanel({ courseId }: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'knowledge'>('knowledge')

  return (
    <div className="flex flex-col h-full">
      {/* Tab Header */}
      <div className="border-b border-gray-200">
        <nav className="flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors",
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
              "flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors",
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
          <SessionHistoryTab courseId={courseId} />
        ) : (
          <KnowledgeBaseTab courseId={courseId} />
        )}
      </div>
    </div>
  )
}