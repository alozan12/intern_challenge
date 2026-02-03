'use client'

import { History, ArrowRight, BookOpen, HelpCircle, MessageSquare, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { CircleProgress } from '@/components/ui/CircleProgress'

interface PreviousSessionCardProps {
  level: string
  progress: number
  lastTested: string
  sessionId?: string
}

export function PreviousSessionCard({ 
  level, 
  progress, 
  lastTested,
  sessionId = "last-session"
}: PreviousSessionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Sample question from previous session
  const question = "What is a binary search tree?";
  const answer = "A binary search tree is a data structure where each node has at most two children, with all values in the left subtree less than the node's value and all values in the right subtree greater than the node's value.";
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#8C1D40]" />
          <h2 className="text-lg font-semibold text-gray-900">Previous Session</h2>
        </div>
        <div className="text-xs text-[#8C1D40] hover:underline cursor-pointer flex items-center gap-1">
          <History className="h-3 w-3" />
          <span>View History</span>
        </div>
      </div>
      
      <div className="flex flex-col">
        {/* Level and course info */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-full bg-[#8C1D40] flex items-center justify-center text-white font-medium">
            {level}
          </div>
          <span className="text-sm text-gray-700">CSE 110 · {lastTested}</span>
        </div>
        
        {/* Question card */}
        <div className="bg-gray-50 rounded-md p-3 border border-gray-200 mb-3">
          <div className="flex gap-2">
            <HelpCircle className="h-5 w-5 text-[#8C1D40] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-900">{question}</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="text-sm font-medium text-[#8C1D40] hover:underline"
          >
            Show Answer
          </button>
          
          <Link 
            href={`/preparation/session/${sessionId}`}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#8C1D40] text-white rounded-md text-sm font-medium"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Continue Session</span>
          </Link>
        </div>
        
        {showAnswer && (
          <div className="mt-3 bg-white p-3 rounded-md border border-gray-200">
            <div className="flex gap-2">
              <CheckSquare className="h-5 w-5 text-[#8C1D40] flex-shrink-0" />
              <p className="text-sm text-gray-600">{answer}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}