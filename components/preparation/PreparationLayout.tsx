'use client'

import { useState, useRef, useEffect } from 'react'
import { LeftPanel } from './LeftPanel'
import { ChatPanel } from './ChatPanel'
import { RightPanel } from './RightPanel'
import { PanelLeftClose, PanelLeft } from 'lucide-react'

interface PreparationLayoutProps {
  courseId: string
  deadlineId: string
}

// Mock course data - in real app would come from API
const getCourseInfo = (courseId: string) => {
  const courses: Record<string, { name: string, code: string }> = {
    '1': { name: 'Introduction to Computer Science', code: 'CSE 110' },
    '2': { name: 'Calculus I', code: 'MAT 265' },
    '3': { name: 'English Composition', code: 'ENG 101' },
    '4': { name: 'General Chemistry', code: 'CHM 113' },
    '5': { name: 'Introduction to Psychology', code: 'PSY 101' }
  }
  return courses[courseId] || { name: 'Course', code: 'COURSE' }
}

export function PreparationLayout({ courseId, deadlineId }: PreparationLayoutProps) {
  const courseInfo = getCourseInfo(courseId)
  const [leftPanelWidth, setLeftPanelWidth] = useState(25)
  const [rightPanelWidth, setRightPanelWidth] = useState(25)
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)
  const [isLeftPanelMinimized, setIsLeftPanelMinimized] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const containerWidth = containerRect.width
    const relativeX = e.clientX - containerRect.left

    if (isResizingLeft) {
      const newWidth = (relativeX / containerWidth) * 100
      setLeftPanelWidth(Math.max(15, Math.min(40, newWidth)))
    } else if (isResizingRight) {
      const rightEdgeX = containerWidth - relativeX
      const newWidth = (rightEdgeX / containerWidth) * 100
      setRightPanelWidth(Math.max(15, Math.min(40, newWidth)))
    }
  }

  const handleMouseUp = () => {
    setIsResizingLeft(false)
    setIsResizingRight(false)
  }

  useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isResizingLeft, isResizingRight])

  const middlePanelWidth = isLeftPanelMinimized 
    ? 100 - 3 - rightPanelWidth  // 3% for minimized panel
    : 100 - leftPanelWidth - rightPanelWidth

  return (
    <div 
      ref={containerRef}
      className="flex h-full bg-gray-50 relative overflow-hidden"
    >
        {/* Left Panel */}
        <div 
          style={{ width: isLeftPanelMinimized ? '3%' : `${leftPanelWidth}%` }}
          className="bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-300 relative"
        >
          {isLeftPanelMinimized ? (
            <div className="h-full flex items-center justify-center">
              <button
                onClick={() => setIsLeftPanelMinimized(false)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Expand panel"
              >
                <PanelLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setIsLeftPanelMinimized(true)}
                className="absolute top-2 right-2 z-10 p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                title="Minimize panel"
              >
                <PanelLeftClose className="w-4 h-4 text-gray-600" />
              </button>
              <LeftPanel courseId={courseId} />
            </>
          )}
        </div>

        {/* Left Resize Handle - only show when not minimized */}
        {!isLeftPanelMinimized && (
          <div
            className="w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize transition-colors relative group flex-shrink-0"
            onMouseDown={() => setIsResizingLeft(true)}
          >
            <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/10" />
          </div>
        )}

        {/* Middle Panel (Chat) */}
        <div 
          style={{ width: `${middlePanelWidth}%` }}
          className="bg-white flex flex-col overflow-hidden"
        >
          <ChatPanel courseId={courseId} deadlineId={deadlineId} />
        </div>

        {/* Right Resize Handle */}
        <div
          className="w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize transition-colors relative group flex-shrink-0"
          onMouseDown={() => setIsResizingRight(true)}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/10" />
        </div>

        {/* Right Panel */}
        <div 
          style={{ width: `${rightPanelWidth}%` }}
          className="bg-white border-l border-gray-200 flex flex-col overflow-hidden"
        >
          <RightPanel courseId={courseId} />
        </div>
    </div>
  )
}