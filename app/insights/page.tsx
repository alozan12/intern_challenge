'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { InsightsList } from '@/components/insights/InsightsList'

export default function InsightsPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/" 
          className="text-[#8C1D40] hover:underline flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">AI Study Insights</h1>
        <p className="text-gray-600 mt-1">
          Personalized recommendations based on your academic performance and upcoming deadlines
        </p>
      </div>
      
      <div className="mb-8">
        <InsightsList count={10} />
      </div>
    </div>
  )
}