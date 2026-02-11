'use client'

import { useState, useEffect } from 'react'
import { Play, Clock, BookOpen, Brain, AlertTriangle, TrendingUp, Calendar, Sparkles, Target, ArrowRight, RefreshCw, Loader2 } from 'lucide-react'
import { AIInsight } from '@/types'
import Link from 'next/link'

interface InsightsListProps {
  count?: number
}

export function InsightsList({ count = 5 }: InsightsListProps) {
  // Default mock insights for fallback and expansion
  const mockInsights: AIInsight[] = [
    {
      id: '1',
      title: 'Review Binary Search Trees',
      description: 'Strengthen your understanding of Binary Search Trees before the upcoming project and exam.',
      duration: 20,
      type: 'review',
      courseId: '112233',
      courseName: 'Data Structures & Algorithms',
      courseCode: 'CSE 310',
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
      courseId: '112235',
      courseName: 'Discrete Mathematical Structures',
      courseCode: 'MAT 243',
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
      title: 'Master Tree Balancing',
      description: 'Focus on understanding AVL and red-black tree algorithms through visual examples and practice problems.',
      duration: 30,
      type: 'strengthen',
      courseId: '112233',
      courseName: 'Data Structures & Algorithms',
      courseCode: 'CSE 310',
      topic: 'tree balancing',
    },
    {
      id: '4',
      title: 'Quick BST Complexity Review',
      description: 'Refresh your understanding of time complexity differences between balanced and unbalanced binary search trees.',
      duration: 10,
      type: 'review',
      courseId: '112233',
      courseName: 'Data Structures & Algorithms',
      courseCode: 'CSE 310',
      topic: 'BST complexity',
    },
    {
      id: '5',
      title: 'Prepare for Graph Algorithms',
      description: 'Preview fundamental graph traversal algorithms before your upcoming quiz on Graphs.',
      duration: 30,
      type: 'prepare',
      courseId: '112233',
      courseName: 'Data Structures & Algorithms',
      courseCode: 'CSE 310',
      topic: 'graph traversal',
      deadline: {
        id: '4',
        title: 'Quiz 3: Graphs',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        type: 'quiz'
      }
    },
    {
      id: '6',
      title: 'Review Procedural Programming',
      description: 'Your quiz results show you need to strengthen your understanding of procedural programming concepts.',
      duration: 20,
      type: 'review',
      courseId: '112234',
      courseName: 'Principles of Programming Languages',
      courseCode: 'CSE 340',
      topic: 'procedural programming',
    },
    {
      id: '7',
      title: 'Practice Shortest Path Algorithms',
      description: 'Complete practice problems on Dijkstra\'s and Bellman-Ford algorithms before your assignment is due.',
      duration: 25,
      type: 'practice',
      courseId: '112233',
      courseName: 'Data Structures & Algorithms',
      courseCode: 'CSE 310',
      topic: 'shortest path algorithms',
      deadline: {
        id: '5',
        title: 'Assignment 3: Graph Algorithms',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        type: 'assignment'
      }
    },
    {
      id: '8',
      title: 'Edge Cases in Tree Operations',
      description: 'Review common edge cases in tree operations that you missed in your last assignment.',
      duration: 15,
      type: 'strengthen',
      courseId: '112233',
      courseName: 'Data Structures & Algorithms',
      courseCode: 'CSE 310',
      topic: 'edge cases in tree operations',
    },
    {
      id: '9',
      title: 'Array Insertion Complexity',
      description: 'Clarify your understanding of array insertion complexity in different scenarios.',
      duration: 10,
      type: 'review',
      courseId: '112233',
      courseName: 'Data Structures & Algorithms',
      courseCode: 'CSE 310',
      topic: 'array insertion complexity',
    },
    {
      id: '10',
      title: 'Functional Programming Concepts',
      description: 'Strengthen your knowledge of key functional programming concepts like immutability and pure functions.',
      duration: 20,
      type: 'practice',
      courseId: '112234',
      courseName: 'Principles of Programming Languages',
      courseCode: 'CSE 340',
      topic: 'functional programming',
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
        console.log('Received recommendations:', data.data.recommendations);
        
        const apiInsights = data.data.recommendations.map((rec: any, index: number) => {
          // Get course info from the first topic
          let courseId = 'unknown';
          let courseName = 'General Course';
          let courseCode = 'CSE 101';
          
          // Try to determine the course from the topic
          if (rec.topics && rec.topics.length > 0) {
            const topic = rec.topics[0].toLowerCase();
            
            // Data structures related topics likely belong to CSE310
            if (topic.includes('tree') || topic.includes('bst') || topic.includes('array') || 
                topic.includes('linked list') || topic.includes('graph')) {
              courseId = '112233';
              courseName = 'Data Structures & Algorithms';
              courseCode = 'CSE310';
            }
            // Programming languages topics likely belong to CSE340
            else if (topic.includes('programming') || topic.includes('functional') || 
                     topic.includes('procedural') || topic.includes('oop')) {
              courseId = '112234';
              courseName = 'Principles of Programming Languages';
              courseCode = 'CSE340';
            }
            // Discrete math topics
            else if (topic.includes('math') || topic.includes('discrete')) {
              courseId = '112235';
              courseName = 'Discrete Mathematical Structures';
              courseCode = 'MAT243';
            }
          }
          
          // Extract deadline if present in the recommendation
          let deadline = undefined;
          if (rec.deadline) {
            deadline = {
              id: rec.deadline.id || `deadline_${index}`,
              title: rec.deadline.title,
              dueDate: new Date(rec.deadline.dueDate),
              type: rec.deadline.type || 'assignment'
            };
          }
          
          return {
            id: `insight_${index}`,
            title: rec.title,
            description: rec.description,
            duration: rec.duration,
            type: rec.type === 'quick' ? 'review' : 'practice',
            courseId: courseId,
            courseName: courseName,
            courseCode: courseCode,
            topic: rec.topics[0] || 'General',
            deadline: deadline
          };
        });
        
        // Get API insights first, then fill remaining with mock insights if needed
        const apiCount = Math.min(apiInsights.length, count);
        const mockCount = Math.max(0, count - apiCount);
        
        setInsights([
          ...apiInsights.slice(0, apiCount),
          ...mockInsights.slice(0, mockCount)
        ]);
      } else {
        // Use mock insights if format doesn't match
        setInsights(mockInsights.slice(0, count));
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError('Failed to load insights');
      setInsights(mockInsights.slice(0, count)); // Use mock data as fallback
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch insights on component mount
  useEffect(() => {
    fetchInsights();
  }, [count]);
  
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FFC627]/20 rounded-md">
            <Brain className="w-5 h-5 text-[#8C1D40]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Personalized Study Recommendations</h2>
        </div>
        <button 
          onClick={regenerateInsights}
          className="text-[#8C1D40] p-2 rounded-full hover:bg-[#f9e5e5] border border-[#8C1D40]/30 flex items-center gap-1"
          aria-label="Regenerate insights"
          title="Refresh recommendations"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1" />
          )}
          <span className="text-sm">Refresh</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm">
            <Loader2 className="h-8 w-8 text-[#8C1D40] animate-spin mb-2" />
            <p className="text-sm text-gray-500">Generating insights...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{error}</p>
            <button
              onClick={regenerateInsights}
              className="mt-3 px-4 py-2 bg-[#8C1D40] text-white rounded-md hover:bg-[#8C1D40]/90 text-sm"
            >
              Try again
            </button>
          </div>
        ) : insights.length === 0 ? (
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <p className="text-sm text-gray-600">No insights available right now.</p>
            <button
              onClick={regenerateInsights}
              className="mt-3 px-4 py-2 bg-[#8C1D40] text-white rounded-md hover:bg-[#8C1D40]/90 text-sm"
            >
              Generate insights
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight) => (
              <div 
                key={insight.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
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
        )}
      </div>
    </div>
  )
}