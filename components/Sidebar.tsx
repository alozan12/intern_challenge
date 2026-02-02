'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, BarChart3, GraduationCap, Calendar, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: BookOpen, label: 'Preparation', href: '/preparation' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Calendar, label: 'Calendar', href: '/calendar' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  return (
    <aside className={cn(
      "bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className={cn("flex-grow overflow-y-auto", isCollapsed ? "p-2" : "p-6")}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "mb-4 p-2 rounded-md hover:bg-gray-100 transition-colors",
            isCollapsed ? "w-full flex justify-center" : "ml-auto flex"
          )}
          title={isCollapsed ? "Expand menu" : "Collapse menu"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Logo Section */}
        <div className={cn(
          "flex items-center mb-8",
          isCollapsed ? "justify-center" : "gap-3"
        )}>
          <div className="w-10 h-10 bg-asu-maroon rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">SC</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">Study Coach</h1>
              <p className="text-xs text-gray-500">ASU Student Portal</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md transition-colors",
                    isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2",
                    pathname === item.href
                      ? "bg-asu-maroon text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* User Section */}
      <div className={cn(
        "border-t border-gray-200 flex-shrink-0 bg-white",
        isCollapsed ? "p-2" : "p-6"
      )}>
        <div className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "gap-3"
        )}>
          <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0" />
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">Student Name</p>
              <p className="text-xs text-gray-500 truncate">student@asu.edu</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}