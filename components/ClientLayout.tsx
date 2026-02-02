'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { HamburgerMenu } from '@/components/HamburgerMenu'
import { TopBar } from '@/components/layout/TopBar'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showSidebar = pathname === '/' || pathname === '/calendar' || pathname === '/analytics' || pathname === '/settings' || pathname.startsWith('/preparation')

  if (showSidebar) {
    // Pages with expanded sidebar
    return (
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <div className="flex-shrink-0 h-screen">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col h-screen">
          <div className="sticky top-0 z-40 bg-white">
            <TopBar />
          </div>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    )
  }

  // Other pages with hamburger menu
  return (
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
  )
}