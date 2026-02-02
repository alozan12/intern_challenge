'use client'

import { Course } from '@/types'
import Link from 'next/link'
import { ChevronRight, BookOpen } from 'lucide-react'

interface CourseProgressProps {
  courses: Course[]
}

export function CourseProgress({ courses }: CourseProgressProps) {
  const sortedCourses = [...courses].sort((a, b) => a.progress - b.progress);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Course Progress</h2>
        <Link
          href="/courses"
          className="text-sm text-asu-maroon hover:underline flex items-center gap-1"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      
      <div className="space-y-3">
        {sortedCourses.map(course => (
          <div key={course.id} className="flex items-center gap-3">
            <div 
              className="w-1.5 h-10 rounded-full flex-shrink-0" 
              style={{ backgroundColor: course.color }}
            ></div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1 text-sm">
                  <BookOpen className="h-3.5 w-3.5 text-gray-600" />
                  <p className="font-medium text-gray-900 truncate">{course.code}</p>
                </div>
                <span className="text-xs font-medium text-gray-700">{course.progress}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="rounded-full h-1.5" 
                  style={{ 
                    width: `${course.progress}%`,
                    backgroundColor: course.color
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}