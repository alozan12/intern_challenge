'use client'

import { useState, useRef, useEffect } from 'react'
import { LeftPanel } from './LeftPanel'
import { ChatPanel } from './ChatPanel'
import { RightPanel } from './RightPanel'
import { PanelLeft } from 'lucide-react'
import { SelectedMaterialsProvider } from '@/context/SelectedMaterialsContext'
import { ChatSessionProvider } from '@/context/ChatSessionContext'

interface PreparationLayoutProps {
  courseId: string
  deadlineId: string
  customSession?: {
    id: string
    name: string
    description: string
    icon: string
    courseId: string
    createdAt: string
    lastAccessed: string
    materials: any[]
  }
}

interface CourseInfo {
  name: string
  code: string
}

interface DeadlineInfo {
  title: string
  type: string
  dueDate: Date
}

export function PreparationLayout({ courseId, deadlineId, customSession }: PreparationLayoutProps) {
  const [courseInfo, setCourseInfo] = useState<CourseInfo>({ name: 'Loading...', code: '...' })
  const [deadlineInfo, setDeadlineInfo] = useState<DeadlineInfo | null>(null)
  const [courseColor, setCourseColor] = useState('#8C1D40')
  const [loading, setLoading] = useState(true)
  const [leftPanelWidth, setLeftPanelWidth] = useState(25)
  const [rightPanelWidth, setRightPanelWidth] = useState(25)
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)
  // Left panel is always expanded
  const isLeftPanelMinimized = false
  
  // Fetch course and deadline info from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Handle custom session
        if (courseId === 'custom' && customSession) {
          setCourseInfo({
            name: customSession.name,
            code: 'Custom Study'
          })
          
          // Use a fixed color for custom sessions
          setCourseColor('#6B46C1') // Purple for custom sessions
          
          setLoading(false)
          return
        }
        
        // Fetch course info for regular sessions
        const coursesResponse = await fetch('/api/courses')
        const coursesData = await coursesResponse.json()
        
        if (coursesData.success) {
          const course = coursesData.courses.find((c: any) => c.course_id === courseId)
          if (course) {
            setCourseInfo({
              name: course.course_name,
              code: course.course_code
            })
            
            // Generate a color based on the course_id
            const colors = [
              '#8C1D40', // ASU Maroon
              '#FF6900', // ASU Orange
              '#00A3E0', // ASU Blue
              '#78BE20', // ASU Green
              '#6B46C1', // Purple
              '#1E429F', // Navy
              '#9B2FAE'  // Pink
            ]
            const colorIndex = parseInt(courseId) % colors.length
            setCourseColor(colors[colorIndex])
          }
        }
        
        // Fetch deadline info
        const deadlinesResponse = await fetch('/api/deadlines')
        const deadlinesData = await deadlinesResponse.json()
        
        if (deadlinesData.success) {
          const deadline = deadlinesData.deadlines.find((d: any) => d.id === deadlineId)
          if (deadline) {
            setDeadlineInfo({
              title: deadline.title,
              type: deadline.type,
              dueDate: new Date(deadline.dueDate)
            })
          }
        }
      } catch (err) {
        console.error('Error fetching preparation data:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [courseId, deadlineId, customSession])
  
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

  const middlePanelWidth = 100 - leftPanelWidth - rightPanelWidth

  return (
    <SelectedMaterialsProvider>
      <ChatSessionProvider>
        <div 
          ref={containerRef}
          className="flex h-full bg-gray-50 relative overflow-hidden"
        >
        <div className="w-full absolute top-0 h-1" style={{ backgroundColor: courseColor }}></div>
          {/* Left Panel - Always expanded */}
          <div 
            style={{ width: `${leftPanelWidth}%` }}
            className="bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-300 relative"
          >
            <LeftPanel courseId={courseId} deadlineId={deadlineId} customSession={customSession} />
        </div>

        {/* Left Resize Handle */}
        <div
          className="w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize transition-colors relative group flex-shrink-0"
          onMouseDown={() => setIsResizingLeft(true)}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/10" />
        </div>

        {/* Middle Panel (Chat) */}
        <div 
          style={{ width: `${middlePanelWidth}%` }}
          className="bg-white flex flex-col overflow-hidden"
        >
          <ChatPanel 
            courseId={courseId} 
            deadlineId={deadlineId} 
            courseName={courseInfo.name} 
            deadlineTitle={customSession ? customSession.description || 'Study Session' : (deadlineInfo?.title || 'Assignment')} 
          />
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
      </ChatSessionProvider>
    </SelectedMaterialsProvider>
  )
}