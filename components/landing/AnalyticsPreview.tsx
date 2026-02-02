'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, Brain, Flame, Clock } from 'lucide-react'
import Link from 'next/link'
import { Analytics } from '@/types'
import { cn } from '@/lib/utils'

interface AnalyticsPreviewProps {
  analytics: Analytics
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: number
  color: string
}

function StatCard({ icon, label, value, trend, color }: StatCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
      <div className={cn("p-2 rounded-lg", color)}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5 text-white" })}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-600 truncate">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
        {trend !== undefined && (
          <p className={cn(
            "text-xs",
            trend > 0 ? "text-green-600" : "text-red-600"
          )}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </p>
        )}
      </div>
    </div>
  )
}

export function AnalyticsPreview({ analytics }: AnalyticsPreviewProps) {
  const [currentStatIndex, setCurrentStatIndex] = useState(0)

  const stats = [
    {
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      label: "Overall Progress",
      value: `${analytics.overallProgress}%`,
      trend: 5,
      color: "bg-asu-maroon"
    },
    {
      icon: <Brain className="w-6 h-6 text-white" />,
      label: "Confidence Level",
      value: `${analytics.confidence}%`,
      trend: 8,
      color: "bg-blue-500"
    },
    {
      icon: <Flame className="w-6 h-6 text-white" />,
      label: "Study Streak",
      value: `${analytics.studyStreak} days`,
      trend: undefined,
      color: "bg-orange-500"
    },
    {
      icon: <Clock className="w-6 h-6 text-white" />,
      label: "Hours Studied",
      value: `${analytics.hoursStudied}h`,
      trend: 12,
      color: "bg-green-500"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % stats.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [stats.length])

  return (
    <div className="bg-white rounded-lg card-shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
        <Link 
          href="/analytics" 
          className="text-sm text-asu-maroon hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="space-y-3">
        {/* Show slideshow by default, grid on larger screens */}
        <div className="xl:hidden">
          <StatCard {...stats[currentStatIndex]} />
          <div className="flex justify-center gap-1 mt-3">
            {stats.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStatIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentStatIndex ? "bg-asu-maroon" : "bg-gray-300"
                )}
                aria-label={`Go to stat ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Show all stats in a vertical list for narrow sidebar */}
        <div className="hidden xl:block space-y-3">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>
    </div>
  )
}