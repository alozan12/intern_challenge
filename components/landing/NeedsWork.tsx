'use client'

import { BookOpen, TrendingUp, Brain, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface WeakArea {
  id: string
  courseId: string
  courseName: string
  courseCode: string
  topic: string
  confidence: number
  type: 'concept' | 'skill' | 'deadline'
}

export function NeedsWork() {
  // Mock data - in a real app, this would come from an API
  const weakAreas: WeakArea[] = [
    {
      id: '1',
      courseId: '1',
      courseName: 'Introduction to Computer Science',
      courseCode: 'CSE 110',
      topic: 'Binary Search Trees',
      confidence: 35,
      type: 'concept'
    },
    {
      id: '2',
      courseId: '2',
      courseName: 'Calculus I',
      courseCode: 'MAT 265',
      topic: 'Integration by Parts',
      confidence: 42,
      type: 'skill'
    },
    {
      id: '3',
      courseId: '4',
      courseName: 'General Chemistry',
      courseCode: 'CHM 113',
      topic: 'Lab Report - Due in 2 days',
      confidence: 25,
      type: 'deadline'
    }
  ]

  // Helper function to get appropriate icon based on weak area type
  function getAreaIcon(type: WeakArea['type']) {
    switch (type) {
      case 'concept':
        return <Brain className="h-4 w-4" />
      case 'skill':
        return <TrendingUp className="h-4 w-4" />
      case 'deadline':
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Needs Work</h2>
      
      <div className="space-y-3 mb-4">
        {weakAreas.map((area) => (
          <div key={area.id} className="border border-gray-100 rounded-md overflow-hidden">
            <div className="p-3">
              <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                <BookOpen className="h-3 w-3" />
                <span>{area.courseCode}</span>
              </div>
              
              <p className="font-medium text-gray-900 mb-1">{area.topic}</p>
              
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1 text-gray-600">
                    {getAreaIcon(area.type)}
                    <span>
                      {area.type === 'concept' && 'Concept Understanding'}
                      {area.type === 'skill' && 'Skill Mastery'}
                      {area.type === 'deadline' && 'Upcoming Deadline'}
                    </span>
                  </span>
                  <span className="font-medium text-asu-maroon">{area.confidence}% Confidence</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-asu-maroon h-1.5 rounded-full" 
                    style={{ width: `${area.confidence}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <Link 
              href={`/preparation/${area.courseId}/${area.id}`}
              className="block py-2 bg-gray-50 text-center text-sm font-medium text-asu-maroon hover:bg-gray-100 transition-colors"
            >
              Practice Now
            </Link>
          </div>
        ))}
      </div>
      
      <Link
        href="/analytics/weak-areas"
        className="text-sm text-asu-maroon hover:underline"
      >
        View All Weak Areas →
      </Link>
    </div>
  )
}