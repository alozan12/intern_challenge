'use client'

import { useState, useEffect } from 'react'
import { FileText, Video, BookOpen, Clock, Filter, Search, Grid, List, Brain, Target, Lightbulb, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { CustomStudySession } from '@/types'

// Mock data for library items
const mockLibraryItems = [
  {
    id: '1',
    title: 'Binary Search Trees - Study Notes',
    type: 'notes',
    course: 'CSE 110',
    lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    created: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Calculus I - Chapter 5 Summary',
    type: 'summary',
    course: 'MAT 265',
    lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Essay Writing Techniques',
    type: 'video',
    course: 'ENG 101',
    lastAccessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    created: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    title: 'Chemistry Lab Report Template',
    type: 'document',
    course: 'CHM 113',
    lastAccessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    created: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
]

type ViewMode = 'grid' | 'list'

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [customSessions, setCustomSessions] = useState<CustomStudySession[]>([])
  const router = useRouter()

  // Load custom sessions from localStorage
  useEffect(() => {
    const loadCustomSessions = () => {
      const sessions = JSON.parse(localStorage.getItem('customStudySessions') || '[]')
      setCustomSessions(sessions)
    }
    
    loadCustomSessions()
    
    // Listen for storage changes
    const handleStorageChange = () => loadCustomSessions()
    window.addEventListener('storage', handleStorageChange)
    
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Combine mock items with custom sessions
  const allItems = [
    ...mockLibraryItems,
    ...customSessions.map(session => ({
      id: session.id,
      title: session.name,
      type: 'custom' as const,
      course: `Custom Study (Course: ${session.courseId})`,
      lastAccessed: new Date(session.lastAccessed),
      created: new Date(session.createdAt),
      icon: session.icon,
      description: session.description,
      courseId: session.courseId
    }))
  ]

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.course.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !selectedType || item.type === selectedType
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: string, item?: any) => {
    if (type === 'custom' && item?.icon) {
      // Return the appropriate icon based on the stored icon name
      switch (item.icon) {
        case 'Brain':
          return Brain
        case 'Target':
          return Target
        case 'Lightbulb':
          return Lightbulb
        case 'GraduationCap':
          return GraduationCap
        case 'FileText':
          return FileText
        case 'BookOpen':
        default:
          return BookOpen
      }
    }
    
    switch (type) {
      case 'notes':
        return FileText
      case 'summary':
        return BookOpen
      case 'video':
        return Video
      case 'document':
        return FileText
      default:
        return FileText
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="px-8 py-6">
      {/* View mode toggle */}
      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === 'grid' ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === 'list' ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-asu-maroon"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={selectedType || ''}
              onChange={(e) => setSelectedType(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-asu-maroon"
            >
              <option value="">All Types</option>
              <option value="custom">Custom Sessions</option>
              <option value="notes">Notes</option>
              <option value="summary">Summaries</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>
          </div>
        </div>
      </div>

      {/* Library Items */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map(item => {
            const Icon = getTypeIcon(item.type, item)
            return (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  if (item.type === 'custom') {
                    router.push(`/preparation/custom/${item.id}`)
                  }
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-gray-100 rounded-md">
                    <Icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <span className="text-xs text-gray-500">{item.course}</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Accessed {formatDate(item.lastAccessed)}</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Name</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Type</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Course</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Last Accessed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map(item => {
                const Icon = getTypeIcon(item.type, item)
                return (
                  <tr 
                    key={item.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      if (item.type === 'custom') {
                        router.push(`/preparation/custom/${item.id}`)
                      }
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-900">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 capitalize">{item.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{item.course}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{formatDate(item.lastAccessed)}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No items found in your library.</p>
        </div>
      )}
    </div>
  )
}