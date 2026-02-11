'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { InsightsList } from '@/components/insights/InsightsList'
import { motion } from 'framer-motion'

export default function InsightsPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page header with consistent styling */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <Link 
          href="/" 
          className="text-[#8C1D40] hover:underline flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-5xl mx-auto"
      >
        <InsightsList count={10} />
      </motion.div>
    </div>
  )
}