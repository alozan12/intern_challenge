'use client'

import { useState, useEffect } from 'react'
import { Play, Clock, BookOpen, Brain, AlertTriangle, TrendingUp, Calendar, Sparkles, Target, ArrowRight, RefreshCw, Loader2 } from 'lucide-react'
import { AIInsight } from '@/types'
import Link from 'next/link'
import { InsightsService } from '@/lib/insights-service'

export function AIInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const insightsService = InsightsService.getInstance();
  
  // Function to fetch insights using the centralized service
  const fetchInsights = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you would get the student ID from auth context
      const studentId = '987654'; // Default student ID from our mock data
      
      // Get preview insights (limited to 3 for landing page)
      const previewInsights = await insightsService.getPreviewInsights(studentId, 3);
      setInsights(previewInsights);
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError('Failed to load insights');
      setInsights([]); // Empty array on error
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch insights on component mount
  useEffect(() => {
    fetchInsights();
    
    // Subscribe to insights updates
    const unsubscribe = insightsService.subscribeToUpdates((updatedInsights) => {
      // Update with preview of new insights
      setInsights(updatedInsights.slice(0, 3));
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Function to regenerate insights
  const regenerateInsights = () => {
    fetchInsights(true); // Force refresh
  };

  // Function to get icon based on insight type and priority
  const getIcon = (insight: AIInsight) => {
    // Determine the icon based on type
    let IconComponent;
    switch (insight.type) {
      case 'review':
        IconComponent = BookOpen;
        break;
      case 'practice':
        IconComponent = Target;
        break;
      case 'strengthen':
        IconComponent = TrendingUp;
        break;
      case 'prepare':
        IconComponent = Sparkles;
        break;
      default:
        IconComponent = BookOpen;
    }
    
    // Determine color based on priority
    let color;
    switch (insight.priority) {
      case 'high':
        color = 'text-red-700';
        break;
      case 'medium':
        color = 'text-yellow-700';
        break;
      case 'low':
        color = 'text-green-700';
        break;
      default:
        color = 'text-gray-700';
    }
    
    return <IconComponent className={`w-4 h-4 ${color}`} />
  }

  // Function to format days until deadline
  const formatDaysUntil = (date: Date | undefined | null): string => {
    if (!date) return 'Unknown date'
    
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    return `In ${diffDays} days`
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
            href="/library?tab=insights"
            className="text-sm text-[#8C1D40] hover:underline flex items-center gap-1"
          >
            <span>View All Insights</span>
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
              className="bg-white rounded-lg p-4 px-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-4 h-4 flex-shrink-0">
                  {getIcon(insight)}
                </div>
                <p className="text-xs font-medium text-gray-500">{insight.courseCode}</p>
              </div>
              
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900 pr-4">{insight.title}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span>{insight.duration} min</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
              
              <div className="flex justify-between items-center gap-4">
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
                  Study
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}