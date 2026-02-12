'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, FileText, FileIcon, FileCode, FileQuestion, Book, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface CourseMaterial {
  material_id: string
  course_id: string
  material_type: string
  week: number
  title: string
  filename: string
  canvas_url: string
  file_url: string
  text_instruction: string
}

interface Course {
  course_id: string
  course_code: string
  course_name: string
  term: string
}

export default function CourseDetailsPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params
  
  const [course, setCourse] = useState<Course | null>(null)
  const [materials, setMaterials] = useState<CourseMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCourseData() {
      try {
        // Fetch course details
        const coursesResponse = await fetch('/api/courses')
        const coursesData = await coursesResponse.json()
        
        if (coursesData.success && coursesData.courses) {
          const foundCourse = coursesData.courses.find((c: Course) => c.course_id === courseId)
          if (foundCourse) {
            setCourse(foundCourse)
          } else {
            setError('Course not found')
          }
        }
        
        // Fetch course materials
        const materialsResponse = await fetch(`/api/courses/${courseId}/materials`)
        const materialsData = await materialsResponse.json()
        
        if (materialsData.success && materialsData.materials) {
          setMaterials(materialsData.materials)
        } else {
          setError(error || 'Failed to fetch course materials')
        }
      } catch (err) {
        console.error('Error fetching course data:', err)
        setError('Error fetching course data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId, error])

  // Group materials by week
  const materialsByWeek: { [key: string]: CourseMaterial[] } = {}
  
  materials.forEach(material => {
    const weekKey = material.week !== null ? `Week ${material.week}` : 'Other'
    if (!materialsByWeek[weekKey]) {
      materialsByWeek[weekKey] = []
    }
    materialsByWeek[weekKey].push(material)
  })

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

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
  }

  // Helper to get appropriate icon for material type
  function getMaterialIcon(type: string) {
    switch (type) {
      case 'lecture_slides':
        return <FileText className="w-4 h-4" />
      case 'syllabus':
        return <FileIcon className="w-4 h-4" />
      case 'assignment':
        return <FileCode className="w-4 h-4" />
      case 'quiz':
        return <FileQuestion className="w-4 h-4" />
      case 'reading':
        return <Book className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back navigation */}
      <Link href="/courses" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-3 h-3 mr-1" />
        Back to Courses
      </Link>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/5"></div>
          <div className="space-y-3 mt-8">
            <div className="h-6 bg-gray-200 rounded w-1/6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 font-medium">{error}</p>
          <p className="text-gray-500 mt-2">Please try again later or return to the courses page.</p>
        </div>
      ) : course ? (
        <>
          {/* Course header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.course_code}</h1>
            <h2 className="text-lg text-gray-700 mb-2">{course.course_name}</h2>
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md">
              {course.term}
            </span>
          </div>

          {/* Course materials by week */}
          <div className="space-y-8">
            {Object.keys(materialsByWeek).sort((a, b) => {
              // Sort "Other" to the end
              if (a === 'Other') return 1
              if (b === 'Other') return -1
              
              // Extract numbers from "Week X" and sort numerically
              const aNum = parseInt(a.replace('Week ', ''))
              const bNum = parseInt(b.replace('Week ', ''))
              return aNum - bNum
            }).map(week => (
              <div key={week}>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{week}</h3>
                
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {materialsByWeek[week].map(material => (
                    <motion.div 
                      key={material.material_id}
                      variants={itemVariants}
                      className="bg-white rounded-md border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                          {getMaterialIcon(material.material_type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {material.title}
                          </h4>
                          
                          <p className="text-xs text-gray-500 mb-2 capitalize">
                            {material.material_type.replace('_', ' ')}
                          </p>
                          
                          {material.canvas_url && (
                            <a 
                              href={material.canvas_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs font-medium text-[#8C1D40] hover:underline"
                            >
                              View in Canvas
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Course not found</p>
        </div>
      )}
    </div>
  )
}