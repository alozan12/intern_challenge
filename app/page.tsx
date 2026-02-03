'use client'

import { DeadlinesSection } from '@/components/landing/DeadlinesSection'
import { ActivityStreak } from '@/components/landing/ActivityStreak'
import { ClickableAnalyticsCard } from '@/components/landing/ClickableAnalyticsCard'
import { PreviousSessionCard } from '@/components/landing/PreviousSessionCard'
import { AIInsights } from '@/components/landing/AIInsights'
import { MiniCalendar } from '@/components/landing/MiniCalendar'
import { Course, Deadline, Analytics } from '@/types'
import { SunMedium } from 'lucide-react'

// Mock data - in a real app, this would come from an API
const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Introduction to Computer Science',
    code: 'CSE 110',
    color: '#8C1D40',
    progress: 78,
    upcomingDeadlines: [
      {
        id: '1',
        title: 'Project 3: Binary Search Trees',
        type: 'assignment',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        courseId: '1'
      },
      {
        id: '2',
        title: 'Midterm Exam',
        type: 'exam',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        courseId: '1'
      }
    ]
  },
  {
    id: '2',
    name: 'Calculus I',
    code: 'MAT 265',
    color: '#FF6900',
    progress: 65,
    upcomingDeadlines: [
      {
        id: '3',
        title: 'Chapter 5 Quiz',
        type: 'quiz',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        courseId: '2'
      }
    ]
  },
  {
    id: '3',
    name: 'English Composition',
    code: 'ENG 101',
    color: '#00A3E0',
    progress: 82,
    upcomingDeadlines: [
      {
        id: '4',
        title: 'Essay Draft',
        type: 'assignment',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        courseId: '3'
      },
      {
        id: '5',
        title: 'Peer Review',
        type: 'discussion',
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        courseId: '3'
      }
    ]
  },
  {
    id: '4',
    name: 'General Chemistry',
    code: 'CHM 113',
    color: '#78BE20',
    progress: 71,
    upcomingDeadlines: [
      {
        id: '6',
        title: 'Lab Report 4',
        type: 'assignment',
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        courseId: '4'
      }
    ]
  },
  {
    id: '5',
    name: 'Introduction to Psychology',
    code: 'PSY 101',
    color: '#6B46C1',
    progress: 88,
    upcomingDeadlines: [
      {
        id: '7',
        title: 'Final Project',
        type: 'assignment',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now - outside 7 day window
        courseId: '5'
      }
    ]
  }
]

const mockAnalytics: Analytics = {
  overallProgress: 74,
  confidence: 68,
  studyStreak: 12,
  hoursStudied: 24.5,
  level: 'B2',
  levelProgress: 82,
  lastTested: '23 Sep 2024'
}

const allDeadlines: Deadline[] = mockCourses.flatMap(course => course.upcomingDeadlines)

export default function LandingPage() {
  return (
    <div className="p-3">
      {/* Page content without the greeting */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Left Section: Cards and AI Insights (66% width) */}
        <section className="lg:w-2/3">
          {/* Top cards - three columns */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <ActivityStreak daysInARow={mockAnalytics.studyStreak} />
            <ClickableAnalyticsCard />
            <PreviousSessionCard 
              level={mockAnalytics.level} 
              progress={mockAnalytics.levelProgress} 
              lastTested={mockAnalytics.lastTested} 
            />
          </div>
          
          {/* AI Insights */}
          <AIInsights />
        </section>

        {/* Right Section: Deadlines (33% width) */}
        <aside className="lg:w-1/3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Deadlines</h2>
          <div className="space-y-2">
            <DeadlinesSection courses={mockCourses} />
            <MiniCalendar deadlines={allDeadlines} />
          </div>
        </aside>
      </div>
    </div>
  )
}