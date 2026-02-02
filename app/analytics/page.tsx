'use client'

import React, { useState } from 'react'
import { ArrowLeft, TrendingUp, Brain, Flame, Clock, BarChart, LineChart, PieChart } from 'lucide-react'
import Link from 'next/link'
import { Analytics, Course } from '@/types'
import { cn } from '@/lib/utils'


// Mock data - in a real app, this would come from an API
const mockAnalytics: Analytics = {
  overallProgress: 74,
  confidence: 68,
  studyStreak: 12,
  hoursStudied: 24.5
}

// Mock courses - imported from landing page
const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Introduction to Computer Science',
    code: 'CSE 110',
    color: '#8C1D40',
    progress: 78,
    upcomingDeadlines: []
  },
  {
    id: '2',
    name: 'Calculus I',
    code: 'MAT 265',
    color: '#FF6900',
    progress: 65,
    upcomingDeadlines: []
  },
  {
    id: '3',
    name: 'English Composition',
    code: 'ENG 101',
    color: '#00A3E0',
    progress: 82,
    upcomingDeadlines: []
  },
  {
    id: '4',
    name: 'General Chemistry',
    code: 'CHM 113',
    color: '#78BE20',
    progress: 71,
    upcomingDeadlines: []
  },
  {
    id: '5',
    name: 'Introduction to Psychology',
    code: 'PSY 101',
    color: '#6B46C1',
    progress: 88,
    upcomingDeadlines: []
  }
]

// Mock data for time series charts
const mockWeeklyProgress = [
  { week: 'Week 1', progress: 60 },
  { week: 'Week 2', progress: 65 },
  { week: 'Week 3', progress: 68 },
  { week: 'Week 4', progress: 72 },
  { week: 'Week 5', progress: 74 }
]

const mockWeeklyConfidence = [
  { week: 'Week 1', confidence: 50 },
  { week: 'Week 2', confidence: 55 },
  { week: 'Week 3', confidence: 60 },
  { week: 'Week 4', confidence: 65 },
  { week: 'Week 5', confidence: 68 }
]

const mockStudyDistribution = [
  { course: 'CSE 110', hours: 8 },
  { course: 'MAT 265', hours: 6.5 },
  { course: 'ENG 101', hours: 4 },
  { course: 'CHM 113', hours: 3.5 },
  { course: 'PSY 101', hours: 2.5 }
]

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: number
  color: string
}

function StatCard({ icon, label, value, trend, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
      <div className={cn("p-3 rounded-lg", color)}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6 text-white" })}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-600 truncate">{label}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
        {trend !== undefined && (
          <p className={cn(
            "text-xs",
            trend > 0 ? "text-green-600" : "text-red-600"
          )}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
          </p>
        )}
      </div>
    </div>
  )
}

interface ChartCardProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

function ChartCard({ title, icon, children }: ChartCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5 text-gray-600" })}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function ProgressChart() {
  return (
    <div className="h-64 w-full">
      <div className="flex justify-between items-end h-48 mt-4">
        {mockWeeklyProgress.map((week, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="relative flex justify-center">
              <div
                className="w-12 bg-asu-maroon rounded-t-md"
                style={{ height: `${week.progress * 0.48}px` }}
              ></div>
            </div>
            <p className="text-xs mt-2 text-gray-600">{week.week}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
        <p className="text-xs text-gray-500">Overall Progress</p>
        <p className="text-xs font-medium text-gray-700">+14% growth</p>
      </div>
    </div>
  )
}

function ConfidenceChart() {
  return (
    <div className="h-64 w-full">
      <div className="h-48 mt-4 relative">
        <div className="absolute inset-0">
          {/* Grid lines */}
          <div className="grid grid-cols-1 grid-rows-4 h-full">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="border-t border-gray-100 relative">
                <span className="absolute -left-6 -top-2 text-xs text-gray-400">
                  {100 - i * 25}%
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Line chart */}
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="confidence-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            points={mockWeeklyConfidence.map((point, i) => 
              `${(i / (mockWeeklyConfidence.length - 1)) * 100}% ${100 - (point.confidence)}%`
            ).join(' ')}
            fill="none"
            stroke="#0284c7"
            strokeWidth="2"
            className="drop-shadow"
          />
          <polygon
            points={`0,100 ${mockWeeklyConfidence.map((point, i) => 
              `${(i / (mockWeeklyConfidence.length - 1)) * 100}% ${100 - (point.confidence)}%`
            ).join(' ')} 100,100`}
            fill="url(#confidence-gradient)"
          />
        </svg>
      </div>
      <div className="flex justify-between mt-2">
        {mockWeeklyConfidence.map((point, i) => (
          <div key={i} className="text-center">
            <p className="text-xs text-gray-600">{point.week}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
        <p className="text-xs text-gray-500">Self-Reported Confidence</p>
        <p className="text-xs font-medium text-gray-700">+18% growth</p>
      </div>
    </div>
  )
}

function StudyDistributionChart() {
  const total = mockStudyDistribution.reduce((acc, item) => acc + item.hours, 0);
  
  return (
    <div className="h-64 w-full">
      <div className="flex h-48 items-center justify-center">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {mockStudyDistribution.map((item, i) => {
              const courseColor = mockCourses.find(c => c.code === item.course)?.color || '#888';
              
              // Calculate start position for this segment
              const previousTotal = mockStudyDistribution
                .slice(0, i)
                .reduce((acc, prevItem) => acc + prevItem.hours, 0);
              
              // Convert to percentage of total circumference
              const startPercentage = (previousTotal / total) * 100;
              const percentage = (item.hours / total) * 100;
              
              // Calculate SVG arc parameters
              const radius = 40;
              const circumference = 2 * Math.PI * radius;
              
              return (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={courseColor}
                  strokeWidth="20"
                  strokeDasharray={`${(percentage / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-((startPercentage / 100) * circumference)}
                />
              );
            })}
            <circle cx="50" cy="50" r="30" fill="white" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl font-semibold">{total}h</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {mockStudyDistribution.map((item, i) => {
          const courseColor = mockCourses.find(c => c.code === item.course)?.color || '#888';
          
          return (
            <div key={i} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: courseColor }}
              ></div>
              <p className="text-xs text-gray-700 truncate">{item.course}: {item.hours}h</p>
            </div>
          );
        })}
      </div>
    </div>
  )
}

function CourseProgressList() {
  return (
    <div className="space-y-4">
      {mockCourses.map((course) => (
        <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">{course.name}</h4>
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: course.color }}
            ></span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full" 
                style={{ 
                  width: `${course.progress}%`, 
                  backgroundColor: course.color 
                }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">{course.progress}%</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Course Progress</span>
            <Link href={`/preparation/${course.id}`} className="text-asu-maroon hover:underline">
              Study Now
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const stats = [
    {
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      label: "Overall Progress",
      value: `${mockAnalytics.overallProgress}%`,
      trend: 5,
      color: "bg-asu-maroon"
    },
    {
      icon: <Brain className="w-6 h-6 text-white" />,
      label: "Confidence Level",
      value: `${mockAnalytics.confidence}%`,
      trend: 8,
      color: "bg-blue-500"
    },
    {
      icon: <Flame className="w-6 h-6 text-white" />,
      label: "Study Streak",
      value: `${mockAnalytics.studyStreak} days`,
      trend: undefined,
      color: "bg-orange-500"
    },
    {
      icon: <Clock className="w-6 h-6 text-white" />,
      label: "Hours Studied",
      value: `${mockAnalytics.hoursStudied}h`,
      trend: 12,
      color: "bg-green-500"
    }
  ]

  return (
    <div className="px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <span className="text-sm text-gray-600">Last updated: Today, 12:30 PM</span>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Course Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* First column - Progress chart */}
        <ChartCard title="Progress Over Time" icon={<BarChart />}>
          <ProgressChart />
        </ChartCard>

        {/* Second column - Confidence chart */}
        <ChartCard title="Confidence Trends" icon={<LineChart />}>
          <ConfidenceChart />
        </ChartCard>

        {/* Third column - Study distribution */}
        <ChartCard title="Study Time Distribution" icon={<PieChart />}>
          <StudyDistributionChart />
        </ChartCard>
      </div>

      {/* Course Specific Progress */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Progress</h2>
        <CourseProgressList />
      </div>
    </div>
  )
}