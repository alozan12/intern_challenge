'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, BarChart, BarChart2 } from 'lucide-react'
import Link from 'next/link'

interface AnalyticData {
  id: string
  title: string
  value: string | number
  subtext: string
  color: string
  percentage?: number
}

export function ClickableAnalyticsCard() {
  const [activeIndex, setActiveIndex] = useState(0)
  
  // Sample analytics data
  const analytics: AnalyticData[] = [
    {
      id: 'study-time',
      title: 'Study Time',
      value: '24.5',
      subtext: 'hours this week',
      color: '#8C1D40', // ASU maroon
      percentage: 72
    },
    {
      id: 'completion',
      title: 'Task Completion',
      value: '87%',
      subtext: 'of assigned work',
      color: '#FFC627', // ASU gold
      percentage: 87
    },
    {
      id: 'quiz-score',
      title: 'Quiz Average',
      value: '89',
      subtext: 'points (last 5 quizzes)',
      color: '#8C1D40', // ASU maroon
      percentage: 89
    },
    {
      id: 'confidence',
      title: 'Confidence',
      value: '68%',
      subtext: 'self-reported',
      color: '#FFC627', // ASU gold
      percentage: 68
    }
  ]

  const handlePrevious = () => {
    setActiveIndex(prev => (prev === 0 ? analytics.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex(prev => (prev === analytics.length - 1 ? 0 : prev + 1))
  }

  // For demonstration purposes, auto-cycle through analytics every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      handleNext()
    }, 5000)
    
    return () => clearInterval(intervalId)
  }, [])

  const current = analytics[activeIndex]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-[#f9e5e5] rounded-md">
            <BarChart2 className="w-5 h-5 text-[#8C1D40]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
        </div>
        <Link 
          href="/analytics" 
          className="text-xs text-[#8C1D40] hover:underline flex items-center gap-1"
        >
          <BarChart className="h-3 w-3" />
          <span>View All</span>
        </Link>
      </div>
      
      <div className="flex items-center justify-between">
        <button 
          onClick={handlePrevious} 
          className="p-1 rounded-full hover:bg-gray-100 active:bg-gray-200"
          type="button"
          aria-label="Previous analytic"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="text-center flex-1 px-4">
          <p className="text-sm text-gray-600">{current.title}</p>
          <div className="text-3xl font-bold" style={{ color: current.color }}>
            {current.value}
          </div>
          <p className="text-xs text-gray-500">{current.subtext}</p>
          
          {current.percentage !== undefined && (
            <div className="mt-3">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${current.percentage}%`,
                    backgroundColor: current.color
                  }}
                />
              </div>
            </div>
          )}
        </div>
        
        <button 
          onClick={handleNext}
          className="p-1 rounded-full hover:bg-gray-100 active:bg-gray-200"
          type="button"
          aria-label="Next analytic"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      
      {/* Dots indicator */}
      <div className="flex justify-center gap-1 mt-4">
        {analytics.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`h-1.5 w-1.5 rounded-full ${
              activeIndex === index ? 'bg-[#8C1D40]' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}