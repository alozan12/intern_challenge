'use client'

import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns'
import Link from 'next/link'
import { Course, Deadline } from '@/types'
import { ArrowRight, Calendar, Clock, FileText, GraduationCap, MessageSquare, ClipboardCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface DeadlinesSectionProps {
  courses: Course[]
  showTitle?: boolean
}

// Helper function to get appropriate icon and color based on deadline type
function getDeadlineTypeInfo(type: Deadline['type']): { icon: React.ReactNode; color: string; bgColor: string; badgeColor: string } {
  switch (type) {
    case 'assignment':
      return {
        icon: <FileText className="w-4 h-4" />,
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        badgeColor: 'bg-blue-100 text-blue-700'
      }
    case 'quiz':
      return {
        icon: <ClipboardCheck className="w-4 h-4" />,
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        badgeColor: 'bg-green-100 text-green-700'
      }
    case 'exam':
      return {
        icon: <GraduationCap className="w-4 h-4" />,
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        badgeColor: 'bg-red-100 text-red-700'
      }
    case 'discussion':
      return {
        icon: <MessageSquare className="w-4 h-4" />,
        color: 'text-purple-700',
        bgColor: 'bg-purple-50',
        badgeColor: 'bg-purple-100 text-purple-700'
      }
    default:
      return {
        icon: <FileText className="w-4 h-4" />,
        color: 'text-gray-700',
        bgColor: 'bg-gray-50',
        badgeColor: 'bg-gray-100 text-gray-700'
      }
  }
}

function getDeadlineLabel(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return formatDistanceToNow(date, { addSuffix: true })
}

export function DeadlinesSection({ courses, showTitle = true }: DeadlinesSectionProps) {
  // Extract all deadlines from all courses and sort by due date
  const allDeadlines = courses.flatMap(course => 
    course.upcomingDeadlines.map(deadline => ({
      ...deadline,
      courseName: course.name,
      courseCode: course.code,
      courseColor: course.color
    }))
  ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  
  // Show all deadlines without filtering
  const filteredDeadlines = allDeadlines;
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className={showTitle ? "bg-white rounded-lg shadow-sm border border-gray-100" : ""}>
      {showTitle && (
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-maroon/5 to-primary-gold/5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
            <Link 
              href="/preparation"
              className="text-xs text-primary-maroon hover:underline flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
      
      {/* Deadlines list */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="divide-y divide-gray-200 max-h-[380px] overflow-y-auto scrollbar-thin">
        {filteredDeadlines.length > 0 ? (
          filteredDeadlines.map((deadline) => (
            <motion.div 
              key={deadline.id} 
              variants={itemVariants}
              className="p-3 hover:bg-gray-50 transition-all duration-200 ease-in-out"
              whileHover={{ backgroundColor: "rgba(248, 248, 252, 1)" }}
            >
              <div className="flex items-start gap-3">
                {/* Icon with background */}
                <div className={cn(
                  "p-2 rounded-lg flex-shrink-0",
                  getDeadlineTypeInfo(deadline.type).bgColor,
                  getDeadlineTypeInfo(deadline.type).color
                )}>
                  {getDeadlineTypeInfo(deadline.type).icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Deadline title and badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {deadline.title}
                    </h3>
                    <span className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded-full",
                      getDeadlineTypeInfo(deadline.type).badgeColor
                    )}>
                      {deadline.type.charAt(0).toUpperCase() + deadline.type.slice(1)}
                    </span>
                  </div>
                  
                  {/* Course info */}
                  <p className="text-xs text-gray-600 mb-2">
                    {deadline.courseCode} - {deadline.courseName}
                  </p>
                  
                  {/* Due date info */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{getDeadlineLabel(deadline.dueDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span suppressHydrationWarning>{format(deadline.dueDate, 'MMM d, h:mm a')}</span>
                    </div>
                  </div>
                </div>
                
                {/* Prepare button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    href={`/preparation/${deadline.courseId}/${deadline.id}`}
                    className="px-3 py-1.5 bg-[#8C1D40] text-white rounded-md text-xs flex items-center gap-1 hover:bg-[#8C1D40]/90 transition-colors shadow-sm"
                  >
                    Prepare
                    <ArrowRight className="w-2 h-2" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">No deadlines found matching your filters.</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}