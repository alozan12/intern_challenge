'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, BarChart3, GraduationCap, Calendar, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  // Sidebar is always expanded

  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: BookOpen, label: 'Preparation', href: '/preparation' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Calendar, label: 'Calendar', href: '/calendar' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  return (
    <aside className="bg-white border-r border-gray-200 h-full flex flex-col w-64">
      <div className="flex-grow overflow-y-auto p-6">
        {/* No toggle button - sidebar always expanded */}

        {/* Logo Section */}
        <div className="flex items-center mb-8 gap-3">
          <div className="w-10 h-10 bg-asu-maroon rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">SC</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Study Coach</h1>
            <p className="text-xs text-gray-500">ASU Student Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md transition-colors gap-3 px-3 py-2",
                    pathname === item.href
                      ? "bg-asu-maroon text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* User Section */}
      <div className="border-t border-gray-200 flex-shrink-0 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0" />
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-900 truncate">Student Name</p>
            <p className="text-xs text-gray-500 truncate">student@asu.edu</p>
          </div>
        </div>
      </div>
    </aside>
  )
}