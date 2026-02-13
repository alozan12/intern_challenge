'use client'

import { 
  ArrowRight, 
  Plus, 
  Flame, 
  History,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { Analytics } from '@/types'
import { useEffect, useState } from 'react'
import { SessionTracker, SessionInfo } from '@/lib/session-tracker'
import { formatDistanceToNow } from 'date-fns'

interface QuickAccessCardsProps {
  analytics?: Analytics;
}

export function QuickAccessCards({ analytics }: QuickAccessCardsProps) {
  // Get student streak from analytics or use a default value
  const streak = analytics?.studyStreak || 0;
  
  // State to hold last session info
  const [lastSession, setLastSession] = useState<SessionInfo | null>(null);
  
  // Get last session on component mount
  useEffect(() => {
    const sessionInfo = SessionTracker.getLastSession();
    setLastSession(sessionInfo);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Get Started Card */}
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
      >
        <Link href="/preparation/custom/new" className="block p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#8C1D40] flex items-center justify-center text-white">
              <Plus className="w-5 h-5" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-semibold text-lg text-gray-900 mb-1">Get Started</h3>
          <p className="text-sm text-gray-600">Create a new study session with AI assistance</p>
        </Link>
      </div>

      {/* Student Streak Card */}
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
      >
        <Link href="/analytics" className="block p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#FFC627] flex items-center justify-center text-[#8C1D40]">
              <Flame className="w-5 h-5" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-semibold text-lg text-gray-900 mb-1">
            {streak > 0 ? `${streak}-Day Streak` : 'Start Your Streak'}
          </h3>
          <p className="text-sm text-gray-600">
            {streak > 0 
              ? `You've studied ${streak} days in a row. Keep it up!` 
              : 'Begin your learning journey today'}
          </p>
        </Link>
      </div>

      {/* Continue Session Card */}
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
      >
        <Link 
          href={lastSession ? lastSession.path : "/library?tab=sessions"} 
          className="block p-5"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#8C1D40]/80 flex items-center justify-center text-white">
              <History className="w-5 h-5" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-semibold text-lg text-gray-900 mb-1">
            {lastSession ? 'Continue Session' : 'Browse Sessions'}
          </h3>
          {lastSession ? (
            <div>
              <p className="text-sm font-medium text-gray-800 mb-1 truncate">{lastSession.title}</p>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-600">
                  {formatDistanceToNow(new Date(lastSession.timestamp), { addSuffix: true })}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">No recent sessions found</p>
          )}
        </Link>
      </div>
    </div>
  )
}