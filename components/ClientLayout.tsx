'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { HamburgerMenu } from '@/components/HamburgerMenu'
import { TopBar } from '@/components/layout/TopBar'
import { ViewModeProvider } from '@/context/ViewModeContext'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showSidebar = pathname === '/' || pathname === '/calendar' || pathname === '/analytics' || pathname === '/settings' || pathname === '/insights' || pathname.startsWith('/preparation') || pathname === '/library'
  
  // Determine if we're in a working session (where minimization should be allowed)
  const isWorkingSession = 
    // Specific preparation pages (with courseId and deadlineId)
    (pathname.startsWith('/preparation/') && pathname.split('/').length > 3) ||
    // Custom sessions
    pathname.startsWith('/preparation/custom/') ||
    // In library viewing a specific session
    (pathname.startsWith('/library/') && pathname.split('/').length > 2)
  
  // Sidebar minimized state
  const [isMinimized, setIsMinimized] = useState(false)
  
  // Set appropriate sidebar state when changing pages
  useEffect(() => {
    if (isWorkingSession) {
      setIsMinimized(true) // Minimized by default in working sessions
    } else {
      setIsMinimized(false) // Expanded in selection/browsing pages
    }
  }, [pathname, isWorkingSession])
  
  const handleToggleSidebar = () => {
    if (isWorkingSession) {
      setIsMinimized(!isMinimized)
    }
  }

  if (showSidebar) {
    // Pages with expanded sidebar
    return (
      <ViewModeProvider>
        <div className="h-screen bg-gray-50 flex overflow-hidden">
          <div className="flex-shrink-0 h-screen">
            <Sidebar 
              isMinimized={isWorkingSession ? isMinimized : false}
              onToggle={isWorkingSession ? handleToggleSidebar : undefined} 
            />
          </div>
          <div className="flex-1 flex flex-col h-screen">
            <div className="sticky top-0 z-40 bg-white">
              <TopBar 
                onToggleSidebar={isWorkingSession ? handleToggleSidebar : undefined}
                isSidebarMinimized={isWorkingSession ? isMinimized : false}
              />
            </div>
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </ViewModeProvider>
    )
  }

  // Other pages with hamburger menu
  return (
    <ViewModeProvider>
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        <div className="sticky top-0 z-40">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <HamburgerMenu />
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-asu-maroon rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">SC</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Study Coach</h1>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Welcome back, Student!</span>
                  <button className="text-sm text-asu-maroon hover:underline">Sign out</button>
                </div>
              </div>
            </div>
          </header>
          <TopBar />
        </div>
        <main className="flex-1 overflow-y-auto px-8 py-8">
          {children}
        </main>
      </div>
    </ViewModeProvider>
  )
}