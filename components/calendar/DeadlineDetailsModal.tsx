'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Calendar, Clock, BookOpen, FileText, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface DeadlineDetailsModalProps {
  deadline: any
  onClose: () => void
  isOpen: boolean
}

export function DeadlineDetailsModal({ deadline, onClose, isOpen }: DeadlineDetailsModalProps) {
  const [courseMaterials, setCourseMaterials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    if (isOpen && deadline?.courseId) {
      // Fetch course materials when modal opens
      const fetchMaterials = async () => {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/courses/${deadline.courseId}/materials`)
          const data = await response.json()
          
          if (data.success && data.materials) {
            setCourseMaterials(data.materials.slice(0, 3)) // Just show first 3 materials
          }
        } catch (err) {
          console.error('Error fetching course materials:', err)
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchMaterials()
    }
  }, [isOpen, deadline?.courseId])
  
  if (!isOpen || !deadline) return null
  
  // Background overlay - closes modal when clicking outside
  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal content - stop propagation to prevent closing when clicking inside */}
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with color bar */}
        <div className="relative">
          <div className="h-1.5 w-full" style={{ backgroundColor: deadline.courseColor }}></div>
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <h2 className="font-semibold text-lg text-gray-900">{deadline.title}</h2>
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">{deadline.courseCode} - {deadline.courseName}</p>
            
            {/* Badge for deadline type */}
            <div className="mt-2">
              <span 
                className={cn(
                  "inline-block text-xs px-2 py-0.5 rounded-full font-medium",
                  deadline.type === 'assignment' && "bg-blue-100 text-blue-800",
                  deadline.type === 'quiz' && "bg-green-100 text-green-800", 
                  deadline.type === 'exam' && "bg-red-100 text-red-800",
                  deadline.type === 'discussion' && "bg-purple-100 text-purple-800"
                )}
              >
                {deadline.type.charAt(0).toUpperCase() + deadline.type.slice(1)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Deadline details */}
        <div className="p-4 space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span suppressHydrationWarning>Due {format(new Date(deadline.dueDate), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span suppressHydrationWarning>At {format(new Date(deadline.dueDate), 'h:mm a')}</span>
              </div>
              {deadline.pointsPossible && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span>Points: {deadline.pointsPossible}</span>
                </div>
              )}
              {deadline.latestScore !== null && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span>Your score: {deadline.latestScore} / {deadline.pointsPossible}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Course materials section */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Related Materials</h3>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-5 w-5 border-2 border-asu-maroon border-t-transparent rounded-full"></div>
              </div>
            ) : courseMaterials.length > 0 ? (
              <div className="space-y-2">
                {courseMaterials.map(material => (
                  <div 
                    key={material.material_id}
                    className="p-2 bg-gray-50 rounded border border-gray-100 flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4 text-asu-maroon" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{material.title}</p>
                      <p className="text-xs text-gray-500">{material.material_type.replace('_', ' ')}</p>
                    </div>
                    {material.canvas_url && (
                      <a 
                        href={material.canvas_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No related materials found</p>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="pt-2 flex justify-between border-t border-gray-100">
            <Link
              href={`/preparation/${deadline.courseId}/${deadline.id}`}
              className="px-4 py-2 bg-asu-maroon text-white rounded-md hover:bg-asu-maroon/90 transition-colors text-sm font-medium flex-1 text-center"
            >
              Prepare for This
            </Link>
            <a 
              href={deadline.canvas_url || '#'} 
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "ml-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors",
                !deadline.canvas_url && "opacity-50 cursor-not-allowed"
              )}
            >
              View in Canvas
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}