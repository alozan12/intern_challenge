'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, BarChart, BarChart2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AnalyticSlide {
  id: string
  title: string
  value: string | number
  subtext: string
  color: string
  percentage?: number
}

export function AnalyticsCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // Sample analytics data
  const slides: AnalyticSlide[] = [
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
  
  const nextSlide = () => {
    console.log('Next slide clicked');
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    console.log('Previous slide clicked');
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };
  
  const current = slides[currentSlide]
  
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
          onClick={() => prevSlide()}
          className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8C1D40] active:bg-gray-200"
          aria-label="Previous analytic"
          type="button"
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
          onClick={() => nextSlide()}
          className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8C1D40] active:bg-gray-200"
          aria-label="Next analytic"
          type="button"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      
      {/* Dots indicator */}
      <div className="flex justify-center gap-1 mt-4">
        {slides.map((_, index) => (
          <span 
            key={index}
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              currentSlide === index
                ? "bg-[#8C1D40]"
                : "bg-gray-300"
            )}
          />
        ))}
      </div>
    </div>
  )
}