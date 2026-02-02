'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

/**
 * PageContainer - A consistent container for page content that applies proper padding
 * to ensure content doesn't crowd against the sidebar
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("px-8 py-6", className)}>
      {children}
    </div>
  )
}