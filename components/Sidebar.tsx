'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, BarChart3, GraduationCap, Calendar, Settings, Library } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isMinimized?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isMinimized = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  // Sidebar is always expanded

  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Library, label: 'My Backpack', href: '/library' },
    { icon: BookOpen, label: 'Coursework', href: '/preparation' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Calendar, label: 'Calendar', href: '/calendar' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  return (
    <aside className={cn(
      "bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300", 
      isMinimized ? "w-20" : "w-64"
    )}>
      <div className="flex-grow overflow-y-auto p-6 relative">
        {/* No toggle button - sidebar always expanded */}

        {/* Logo Section */}
        <div className="flex items-center mb-8 gap-3">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <Image 
              src="/mock_assets/logo.png" 
              alt="Study Coach Logo" 
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          {!isMinimized && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">Study Coach</h1>
              <p className="text-xs text-gray-500">ASU Student Portal</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav>
          <ul className="space-y-5">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md transition-colors gap-3 px-3 py-2",
                    isMinimized && "justify-center",
                    pathname === item.href || 
                    (item.href === '/preparation' && pathname.startsWith('/preparation') && !pathname.includes('/custom/')) ||
                    (item.href === '/library' && (pathname.startsWith('/library') || pathname.includes('/preparation/custom/')))
                      ? "bg-asu-maroon text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className={cn("flex-shrink-0", isMinimized ? "w-6 h-6" : "w-5 h-5")} />
                  {!isMinimized && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* User Section */}
      <div className="border-t border-gray-200 flex-shrink-0 bg-white p-6">
        <div className={cn("flex items-center gap-3", isMinimized && "justify-center")}>
          <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0" />
          {!isMinimized && (
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