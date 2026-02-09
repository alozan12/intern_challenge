'use client'

import { useState, useEffect } from 'react'
import { Play, Clock, BookOpen, Brain, AlertTriangle, TrendingUp, Calendar, Sparkles, Target, ArrowRight, RefreshCw, Loader2 } from 'lucide-react'
import { AIInsight } from '@/types'
import Link from 'next/link'

export function AIInsights() {
  // Default mock insights for fallback
  const mockInsights: AIInsight[] = [
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
    }
  ];
  
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch real insights from the API
  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you would get the student ID from auth context
      const studentId = '987654'; // Default student ID from our mock data
      
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId,
          insightType: 'recommendation'
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Map the recommendations to our AIInsight format
      if (data.type === 'recommendation' && Array.isArray(data.data?.recommendations)) {
        const mappedInsights: AIInsight[] = data.data.recommendations.map((rec: any, index: number) => {
          // Extract the first course info (in real app, match to topic)
          const courseInfo = {
            id: rec.topics[0] ? 'course_' + index : 'unknown',
            name: rec.topics[0] || 'General Course',
            code: 'CSE 101'
          };
          
          return {
            id: `insight_${index}`,
            title: rec.title,
            description: rec.description,
            duration: rec.duration,
            type: rec.type === 'quick' ? 'review' : 'practice',
            courseId: courseInfo.id,
            courseName: courseInfo.name,
            courseCode: courseInfo.code,
            topic: rec.topics[0] || 'General'
            // No deadline for recommendations
          };
        });
        
        setInsights(mappedInsights);
      } else {
        // Fallback to mock insights if format doesn't match
        setInsights(mockInsights);
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError('Failed to load insights');
      setInsights(mockInsights); // Use mock data as fallback
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch insights on component mount
  useEffect(() => {
    fetchInsights();
  }, []);
  
  // Function to regenerate insights
  const regenerateInsights = () => {
    fetchInsights();
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
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-[#8C1D40] animate-spin mb-2" />
            <p className="text-sm text-gray-500">Generating insights...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{error}</p>
            <button
              onClick={regenerateInsights}
              className="mt-2 text-sm text-[#8C1D40] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : insights.length === 0 ? (
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <p className="text-sm text-gray-600">No insights available right now.</p>
            <button
              onClick={regenerateInsights}
              className="mt-2 text-sm text-[#8C1D40] hover:underline"
            >
              Generate insights
            </button>
          </div>
        ) : (
          insights.map((insight) => (
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
          ))
        )}
      </div>
    </div>
  )
}