'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PreparationLayout } from '@/components/preparation/PreparationLayout'
import { SessionTracker } from '@/lib/session-tracker'

export default function PreparationPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const deadlineId = params.deadlineId as string

  // Track this session when the component mounts
  useEffect(() => {
    // We can fetch the actual deadline title from the API, but for now we'll use a generic title
    const sessionTitle = `Preparation Session - Course ${courseId}`;

    // Track this session
    SessionTracker.trackSession({
      id: deadlineId,
      courseId: courseId,
      deadlineId: deadlineId,
      title: sessionTitle,
      isCustom: false,
      path: `/preparation/${courseId}/${deadlineId}`
    });
  }, [courseId, deadlineId]);

  return (
    <PreparationLayout courseId={courseId} deadlineId={deadlineId} />
  )
}