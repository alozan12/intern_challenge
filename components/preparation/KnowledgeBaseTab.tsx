'use client'

import { useState } from 'react'
import { FileText, Video, BookOpen, ClipboardList, Package, Check, Save } from 'lucide-react'
import { KnowledgeBaseItem } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface KnowledgeBaseTabProps {
  courseId: string
}

// Mock data - replace with API call
const getMockKnowledgeBase = (courseId: string): KnowledgeBaseItem[] => {
  // Generate mock data for any courseId
  const baseItems = [
    {
      id: '1',
      title: 'Week 8: Binary Search Trees',
      type: 'lecture' as const,
      content: 'Introduction to BST operations...',
      lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isSelected: true
    },
    {
      id: '2',
      title: 'Assignment 3: BST Implementation',
      type: 'assignment' as const,
      content: 'Implement a binary search tree...',
      isSelected: true
    },
    {
      id: '3',
      title: 'Quiz 5: Tree Traversals',
      type: 'quiz' as const,
      content: 'Practice questions on tree traversal...',
      isSelected: false
    },
    {
      id: '4',
      title: 'Chapter 7: Advanced Data Structures',
      type: 'reading' as const,
      content: 'Textbook chapter on advanced DS...',
      isSelected: false
    },
    {
      id: '5',
      title: 'Module 4: Trees and Graphs',
      type: 'module' as const,
      content: 'Complete module on tree structures...',
      isSelected: true
    },
    {
      id: '6',
      title: 'Week 9: Hash Tables',
      type: 'lecture' as const,
      content: 'Understanding hash functions and collision resolution...',
      isSelected: false
    },
    {
      id: '7',
      title: 'Practice Problems: Sorting Algorithms',
      type: 'assignment' as const,
      content: 'Implement quicksort and mergesort...',
      isSelected: true
    },
    {
      id: '8',
      title: 'Midterm Review Session',
      type: 'module' as const,
      content: 'Comprehensive review of data structures...',
      isSelected: true
    }
  ]
  
  return baseItems.map(item => ({
    ...item,
    courseId
  }))
}

export function KnowledgeBaseTab({ courseId }: KnowledgeBaseTabProps) {
  // Get mock knowledge base items for this course
  const [items, setItems] = useState(() => getMockKnowledgeBase(courseId))
  const [filter, setFilter] = useState<'all' | KnowledgeBaseItem['type']>('all')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isSelected: !item.isSelected } : item
    ))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call to save selections
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setLastSaved(new Date())
  }

  const getItemIcon = (type: KnowledgeBaseItem['type']) => {
    switch(type) {
      case 'lecture':
        return <Video className="w-4 h-4" />
      case 'assignment':
        return <ClipboardList className="w-4 h-4" />
      case 'quiz':
        return <FileText className="w-4 h-4" />
      case 'reading':
        return <BookOpen className="w-4 h-4" />
      case 'module':
        return <Package className="w-4 h-4" />
    }
  }

  const getItemColor = (type: KnowledgeBaseItem['type']) => {
    switch(type) {
      case 'lecture':
        return 'text-blue-600 bg-blue-50'
      case 'assignment':
        return 'text-orange-600 bg-orange-50'
      case 'quiz':
        return 'text-green-600 bg-green-50'
      case 'reading':
        return 'text-purple-600 bg-purple-50'
      case 'module':
        return 'text-indigo-600 bg-indigo-50'
    }
  }

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.type === filter)

  const selectedCount = items.filter(item => item.isSelected).length

  return (
    <div className="h-full flex flex-col">
      {/* Filter Pills */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === 'all'
                ? "bg-asu-maroon text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('lecture')}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === 'lecture'
                ? "bg-asu-maroon text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Lectures
          </button>
          <button
            onClick={() => setFilter('assignment')}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === 'assignment'
                ? "bg-asu-maroon text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Assignments
          </button>
          <button
            onClick={() => setFilter('quiz')}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === 'quiz'
                ? "bg-asu-maroon text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Quizzes
          </button>
          <button
            onClick={() => setFilter('reading')}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === 'reading'
                ? "bg-asu-maroon text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Readings
          </button>
          <button
            onClick={() => setFilter('module')}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === 'module'
                ? "bg-asu-maroon text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Modules
          </button>
        </div>
        <div className="text-xs text-gray-600">
          {selectedCount} items selected for knowledge base
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={cn(
              "p-3 rounded-lg border cursor-pointer transition-all",
              item.isSelected
                ? "border-asu-maroon bg-red-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-md",
                getItemColor(item.type)
              )}>
                {getItemIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  {item.type}
                </p>
              </div>
              <div className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                item.isSelected
                  ? "bg-asu-maroon border-asu-maroon"
                  : "border-gray-300"
              )}>
                {item.isSelected && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button at Bottom */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-gray-500">
                Last saved: {format(lastSaved, 'h:mm a')}
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              isSaving 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-asu-maroon text-white hover:bg-red-900"
            )}
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Knowledge Base'}
          </button>
        </div>
      </div>
    </div>
  )
}