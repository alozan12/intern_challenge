'use client'

import { useState } from 'react'
import { Play, Clock, BookOpen, Brain, AlertTriangle, TrendingUp, Calendar, Sparkles, Target, ArrowRight, RefreshCw } from 'lucide-react'
import { AIInsight } from '@/types'
import Link from 'next/link'

export function AIInsights() {
  // All possible insights
  const allInsights: AIInsight[] = [
    {
      id: '1',
      title: 'Review Binary Search Trees',
      description: 'Strengthen your understanding of Binary Search Trees before the upcoming project and exam.',
      duration: 20,
      type: 'review',
      courseId: '1',
      courseName: 'Introduction to Computer Science',
      courseCode: 'CSE 110',
      topic: 'Binary Search Trees',
      deadline: {
        id: '1',
        title: 'Project 3: Binary Search Trees',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        type: 'assignment'
      }
    },
    {
      id: '2',
      title: 'Practice Integration Techniques',
      description: 'Your recent quiz showed difficulty with Integration by Parts. Let\'s strengthen this skill before your Chapter 5 Quiz tomorrow.',
      duration: 15,
      type: 'practice',
      courseId: '2',
      courseName: 'Calculus I',
      courseCode: 'MAT 265',
      topic: 'Integration by Parts',
      deadline: {
        id: '3',
        title: 'Chapter 5 Quiz',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        type: 'quiz'
      }
    },
    {
      id: '3',
      title: 'Prepare for Chemical Bonding',
      description: 'Review VSEPR Theory and Molecular Orbital Theory from your last quiz where you scored 58%.',
      duration: 25,
      type: 'strengthen',
      courseId: '4',
      courseName: 'General Chemistry',
      courseCode: 'CHM 113',
      topic: 'Molecular Orbital Theory'
    },
    {
      id: '4',
      title: 'Learn Rhetorical Analysis Techniques',
      description: 'Prepare for your upcoming Essay Draft by learning about rhetorical analysis strategies.',
      duration: 15,
      type: 'prepare',
      courseId: '3',
      courseName: 'English Composition',
      courseCode: 'ENG 101',
      topic: 'Rhetorical Analysis',
      deadline: {
        id: '4',
        title: 'Essay Draft',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        type: 'assignment'
      }
    }
  ];
  
  // Function to get 2 random insights
  const getRandomInsights = () => {
    // Sort by deadline proximity first (prioritize closer deadlines)
    const sorted = [...allInsights].sort((a, b) => {
      const aDate = a.deadline?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const bDate = b.deadline?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      return aDate.getTime() - bDate.getTime();
    });
    
    // Take the first 2 insights
    return sorted.slice(0, 2);
  };
  
  const [insights, setInsights] = useState<AIInsight[]>(getRandomInsights());
  
  // Function to regenerate insights
  const regenerateInsights = () => {
    setInsights(getRandomInsights());
  };

  // Function to get icon based on insight type
  const getIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'review':
        return <BookOpen className="w-4 h-4 text-[#8C1D40]" />
      case 'practice':
        return <Target className="w-4 h-4 text-[#8C1D40]" />
      case 'strengthen':
        return <TrendingUp className="w-4 h-4 text-[#8C1D40]" />
      case 'prepare':
        return <Sparkles className="w-4 h-4 text-[#8C1D40]" />
    }
  }

  // Function to format days until deadline
  const formatDaysUntil = (date: Date): string => {
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    return `In ${diffDays} days`
  }
  
  return (
    <div className="bg-[#FFF8E8] rounded-lg shadow-sm border border-[#FFC627]/30 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-[#FFC627]/20 rounded-md">
            <Brain className="w-5 h-5 text-[#8C1D40]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={regenerateInsights}
            className="text-[#8C1D40] p-1.5 rounded-full hover:bg-[#f9e5e5] border border-[#8C1D40]/30"
            aria-label="Regenerate insights"
            title="Refresh recommendations"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <Link 
            href="/insights"
            className="text-sm text-[#8C1D40] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">
        Personalized recommendations based on your academic performance and upcoming deadlines
      </p>
      
      <div className="space-y-3">
        {insights.map((insight) => (
          <div 
            key={insight.id}
            className="bg-white rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-4 h-4 flex-shrink-0">
                {getIcon(insight.type)}
              </div>
              <p className="text-xs font-medium text-gray-500">{insight.courseCode}</p>
            </div>
            
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900">{insight.title}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>{insight.duration} min</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
            
            <div className="flex justify-between items-center">
              {insight.deadline ? (
                <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDaysUntil(insight.deadline.dueDate)} • {insight.deadline.title}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-[#8C1D40] bg-[#f9e5e5] px-2 py-1 rounded-md">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Weak area</span>
                </div>
              )}
              
              <Link 
                href={`/study/${insight.courseId}/${insight.topic}`}
                className="px-3 py-1.5 bg-[#8C1D40] text-white rounded text-sm font-medium hover:bg-[#8C1D40]/90"
              >
                Start
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}