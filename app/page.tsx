'use client'

import { DeadlinesSection } from '@/components/landing/DeadlinesSection'
import { ActivityStreak } from '@/components/landing/ActivityStreak'
import { AnalyticsCarousel } from '@/components/landing/AnalyticsCarousel'
import { PreviousSessionCard } from '@/components/landing/PreviousSessionCard'
import { AIInsights } from '@/components/landing/AIInsights'
import { MiniCalendar } from '@/components/landing/MiniCalendar'
import { Course, Analytics } from '@/types'
import { ArrowRight, SunMedium } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

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
    ],
    quizPerformance: [
      {
        id: 'q1',
        title: 'Quiz 2: Data Structures',
        score: 72,
        totalPoints: 100,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        weakAreas: ['Binary Search Trees', 'Heap Operations', 'Time Complexity Analysis']
      }
    ],
    weakTopics: ['Binary Search Trees', 'Heap Operations', 'Time Complexity Analysis'],
    upcomingTopics: ['Graph Algorithms', 'Linked Lists']
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
    ],
    quizPerformance: [
      {
        id: 'q2',
        title: 'Quiz 3: Integration',
        score: 65,
        totalPoints: 100,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        weakAreas: ['Integration by Parts', 'Improper Integrals']
      }
    ],
    weakTopics: ['Integration by Parts', 'Improper Integrals', 'Applications of Integration'],
    upcomingTopics: ['Series and Sequences', 'Convergence Tests']
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
    ],
    quizPerformance: [
      {
        id: 'q3',
        title: 'Quiz on APA Citation',
        score: 90,
        totalPoints: 100,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        weakAreas: ['In-text Citations']
      }
    ],
    weakTopics: ['In-text Citations', 'Argumentative Structure'],
    upcomingTopics: ['Rhetorical Analysis', 'Literary Criticism']
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
    ],
    quizPerformance: [
      {
        id: 'q4',
        title: 'Quiz on Chemical Bonding',
        score: 58,
        totalPoints: 100,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        weakAreas: ['Molecular Orbital Theory', 'Hybridization', 'VSEPR Theory']
      }
    ],
    weakTopics: ['Molecular Orbital Theory', 'Hybridization', 'VSEPR Theory'],
    upcomingTopics: ['Acids and Bases', 'Chemical Equilibrium']
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
    ],
    quizPerformance: [
      {
        id: 'q5',
        title: 'Quiz on Neuropsychology',
        score: 92,
        totalPoints: 100,
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        weakAreas: []
      }
    ],
    weakTopics: [],
    upcomingTopics: ['Social Psychology', 'Cognitive Development']
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

// Removed - using real data now

export default function LandingPage() {
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50">
      {/* Page header with subtle animation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex items-center gap-3"
      >
        <div className="w-1.5 h-8 bg-asu-gold rounded-sm"></div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col lg:flex-row gap-6 max-w-full overflow-hidden">
        {/* Left Section: AI Insights (66% width) */}
        <motion.section 
          variants={itemVariants}
          className="w-full lg:w-2/3"
        >
          <AIInsights />
        </motion.section>

        {/* Right Section: Deadlines and Calendar (33% width) */}
        <motion.aside 
          variants={itemVariants}
          className="w-full lg:w-1/3 space-y-6"
        >
          {/* Upcoming Deadlines Box */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
                <Link 
                  href="/coursework" 
                  className="text-sm text-[#8C1D40] hover:underline flex items-center gap-1"
                >
                  <span>View All Coursework</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
            <DeadlinesSection useLiveData={true} showTitle={false} />
          </div>
          
          {/* Calendar Box (Separate) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Calendar</h2>
            </div>
            <div className="p-4">
              <MiniCalendar useLiveData={true} />
            </div>
          </div>
        </motion.aside>
      </motion.div>
    </div>
  )
}