'use client'

import { useState } from 'react'
import { Play, Clock, BookOpen, Brain } from 'lucide-react'

interface Insight {
  id: string
  title: string
  description: string
  duration: number // in minutes
  type: 'pronunciation' | 'grammar' | 'vocabulary' | 'listening'
  completed?: boolean
}

export function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([
    {
      id: '1',
      title: 'Practicing pronunciation',
      description: 'This exercise will help you improve your accent',
      duration: 15,
      type: 'pronunciation'
    },
    {
      id: '2',
      title: 'Improving Grammar',
      description: 'Complete this exercise to strengthen your understanding!',
      duration: 25,
      type: 'grammar'
    },
    {
      id: '3',
      title: 'Expanding Vocabulary',
      description: 'Try this exercise to learn new words and phrases for better communication!',
      duration: 20,
      type: 'vocabulary'
    },
    {
      id: '4',
      title: 'Enhancing Listening Comprehension',
      description: 'This exercise will boost your listening skills with native-speed audio.',
      duration: 15,
      type: 'listening',
      completed: true
    }
  ])

  // Function to get icon based on insight type
  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'pronunciation':
        return <Play className="w-4 h-4" />
      case 'grammar':
        return <BookOpen className="w-4 h-4" />
      case 'vocabulary':
        return <Brain className="w-4 h-4" />
      case 'listening':
        return <Play className="w-4 h-4" />
    }
  }
  
  return (
    <div className="bg-[#FFF8E8] rounded-lg shadow-sm border border-[#FFC627]/30 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1 bg-[#FFC627]/20 rounded-md">
          <Brain className="w-5 h-5 text-[#8C1D40]" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        AI has prepared these recommendations to improve its skills
      </p>
      
      <div className="space-y-3">
        {insights.map((insight) => (
          <div 
            key={insight.id}
            className="bg-white rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{insight.title}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{insight.duration} min</span>
                </div>
              </div>
              
              <button 
                className="px-3 py-1 bg-white text-sm font-medium text-[#8C1D40] hover:bg-[#f9e5e5] rounded border border-[#8C1D40]/30"
              >
                Start
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-1">{insight.description}</p>
            
            {insight.completed && (
              <div className="flex items-center gap-1 text-xs text-[#8C1D40] bg-[#f9e5e5] px-2 py-0.5 rounded-sm w-fit">
                <span className="h-1.5 w-1.5 bg-[#8C1D40] rounded-full"></span>
                <span>Complete</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}