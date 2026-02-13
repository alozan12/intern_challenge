'use client'

import { Summary } from '@/types'
import { X, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SummaryViewerProps {
  summary: Summary
  onClose?: () => void
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

export function SummaryViewer({
  summary,
  onClose,
  isFullscreen = false,
  onToggleFullscreen
}: SummaryViewerProps) {
  return (
    <div className={cn(
      "flex flex-col bg-white",
      isFullscreen ? "fixed inset-0 z-50 h-screen" : "h-full"
    )}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{summary.title}</h2>
            <p className="text-sm text-gray-600">
              Summary • {new Date(summary.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          {/* Key Points */}
          {summary.content.keyPoints && summary.content.keyPoints.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Key Points</h3>
              <ul className="list-disc pl-5 space-y-2">
                {summary.content.keyPoints.map((point, index) => (
                  <li key={index} className="text-gray-700">{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Main Summary Text */}
          {summary.content.text && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Summary</h3>
              <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                {summary.content.text}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}