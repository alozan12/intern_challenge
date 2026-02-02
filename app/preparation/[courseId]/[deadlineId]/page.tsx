'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PreparationLayout } from '@/components/preparation/PreparationLayout'

export default function PreparationPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const deadlineId = params.deadlineId as string

  return (
    <PreparationLayout courseId={courseId} deadlineId={deadlineId} />
  )
}