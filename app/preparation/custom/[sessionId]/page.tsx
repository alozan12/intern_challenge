'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PreparationLayout } from '@/components/preparation/PreparationLayout'

export default function CustomPreparationPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    // Load session data from localStorage
    const sessions = JSON.parse(localStorage.getItem('customStudySessions') || '[]')
    const session = sessions.find((s: any) => s.id === sessionId)
    
    if (!session) {
      // Session not found, redirect to library
      router.push('/library')
      return
    }
    
    setSessionData(session)
    console.log('Custom session loaded:', session)
    console.log('Session courseId:', session.courseId)
    
    // Update last accessed time
    const updatedSessions = sessions.map((s: any) => 
      s.id === sessionId 
        ? { ...s, lastAccessed: new Date().toISOString() }
        : s
    )
    localStorage.setItem('customStudySessions', JSON.stringify(updatedSessions))
  }, [sessionId, router])

  if (!sessionData) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <PreparationLayout 
      courseId="custom" 
      deadlineId={sessionId}
      customSession={sessionData}
    />
  )
}