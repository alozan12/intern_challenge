'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Calendar, BarChart, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarLinkProps {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
}

function SidebarLink({ href, icon, label, active }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
        active 
          ? "bg-asu-maroon text-white" 
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { 
        className: cn("w-5 h-5", active ? "text-white" : "text-gray-500")
      })}
      <span className="font-medium">{label}</span>
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  
  const links = [
    { href: "/", icon: <Home />, label: "Dashboard" },
    { href: "/courses", icon: <BookOpen />, label: "Courses" },
    { href: "/calendar", icon: <Calendar />, label: "Calendar" },
    { href: "/analytics", icon: <BarChart />, label: "Analytics" },
    { href: "/profile", icon: <User />, label: "Profile" },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-6 mb-6">
        <div className="bg-asu-maroon text-white font-bold text-lg w-10 h-10 rounded-md flex items-center justify-center">
          SC
        </div>
        <div>
          <h1 className="font-bold text-gray-900">Study Coach</h1>
          <p className="text-xs text-gray-500">ASU Learning Platform</p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="space-y-1">
        {links.map(link => (
          <SidebarLink
            key={link.href}
            href={link.href}
            icon={link.icon}
            label={link.label}
            active={pathname === link.href}
          />
        ))}
      </nav>
    </aside>
  )
}