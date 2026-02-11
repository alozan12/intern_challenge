'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Book, BookOpen, FileText, GraduationCap } from 'lucide-react'
import { motion } from 'framer-motion'

interface Course {
  course_id: string
  course_code: string
  course_name: string
  term: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/courses')
        const data = await response.json()
        
        if (data.success && data.courses) {
          setCourses(data.courses)
        } else {
          setError('Failed to fetch courses')
        }
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Error fetching courses')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  }

  // Assign colors to courses based on index
  const courseColors = [
    '#8C1D40', // ASU Maroon
    '#FF6900', // ASU Orange
    '#00A3E0', // ASU Blue
    '#78BE20', // ASU Green
    '#6B46C1', // Purple
    '#1E429F', // Navy
    '#9B2FAE'  // Pink
  ]

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page header with subtle animation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex items-center gap-3"
      >
        <div className="w-1.5 h-8 bg-asu-gold rounded-sm"></div>
        <h1 className="text-2xl font-bold text-gray-900">Your Courses</h1>
      </motion.div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-40 bg-gray-200 rounded col-span-1"></div>
                  <div className="h-40 bg-gray-200 rounded col-span-1"></div>
                  <div className="h-40 bg-gray-200 rounded col-span-1"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-40 bg-gray-200 rounded col-span-1"></div>
                  <div className="h-40 bg-gray-200 rounded col-span-1"></div>
                  <div className="h-40 bg-gray-200 rounded col-span-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 font-medium">{error}</p>
            <p className="text-gray-500 mt-2">Please try again later.</p>
          </div>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {courses.map((course, index) => (
            <motion.div 
              key={course.course_id}
              variants={itemVariants}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div 
                className="h-2" 
                style={{ backgroundColor: courseColors[index % courseColors.length] }}
              ></div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {course.course_code}
                    </h3>
                    <p className="text-gray-500 text-sm mb-2">
                      {course.course_name}
                    </p>
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md">
                      {course.term}
                    </span>
                  </div>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${courseColors[index % courseColors.length]}20` }}
                  >
                    <BookOpen 
                      className="w-5 h-5"
                      style={{ color: courseColors[index % courseColors.length] }}
                    />
                  </div>
                </div>
                
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <Link
                    href={`/courses/${course.course_id}`}
                    className="flex items-center justify-center gap-1 text-sm font-medium text-[#8C1D40] hover:underline"
                  >
                    View Course Materials
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}