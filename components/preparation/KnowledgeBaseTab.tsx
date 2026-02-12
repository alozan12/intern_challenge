'use client'

import { useState, useEffect } from 'react'
import { FileText, Video, BookOpen, ClipboardList, Package, Check } from 'lucide-react'
import { KnowledgeBaseItem } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useSelectedMaterials } from '@/context/SelectedMaterialsContext'

interface KnowledgeBaseTabProps {
  courseId: string
}

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

// Function to map database course materials to KnowledgeBaseItem format
const mapMaterialsToKnowledgeBase = (materials: CourseMaterial[]): KnowledgeBaseItem[] => {
  return materials.map(material => {
    // Map material_type to KnowledgeBaseItem type
    let itemType: 'lecture' | 'assignment' | 'quiz' | 'reading' | 'module' = 'lecture';
    
    switch(material.material_type.toLowerCase()) {
      case 'lecture':
      case 'video':
      case 'presentation':
        itemType = 'lecture';
        break;
      case 'assignment':
      case 'homework':
      case 'project':
        itemType = 'assignment';
        break;
      case 'quiz':
      case 'exam':
      case 'test':
        itemType = 'quiz';
        break;
      case 'reading':
      case 'text':
      case 'document':
      case 'pdf':
      case 'article':
        itemType = 'reading';
        break;
      case 'module':
      case 'section':
      case 'chapter':
        itemType = 'module';
        break;
      default:
        // Default to lecture instead of module
        itemType = 'lecture';
        break;
    }
    
    return {
      id: material.material_id,
      courseId: material.course_id,
      title: material.title,
      type: itemType,
      content: material.text_instruction || 'No content available',
      isSelected: false
    };
  });
};


export function KnowledgeBaseTab({ courseId }: KnowledgeBaseTabProps) {
  const [items, setItems] = useState<KnowledgeBaseItem[]>([])
  const [filter, setFilter] = useState<'all' | KnowledgeBaseItem['type']>('all')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { updateSelectedMaterials } = useSelectedMaterials()
  
  useEffect(() => {
    const fetchMaterials = async () => {
      console.log(`KnowledgeBaseTab: Fetching materials for courseId: ${courseId}`)
      setIsLoading(true)
      setError(null)
      try {
        // Ensure courseId is valid before making the request
        if (!courseId || courseId.trim() === '') {
          throw new Error('Invalid course ID');
        }
        
        console.log(`KnowledgeBaseTab: Sending request to /api/courses/${courseId}/materials`)
        const response = await fetch(`/api/courses/${courseId}/materials`)
        
        console.log(`KnowledgeBaseTab: Response status:`, response.status)
        
        if (!response.ok) {
          const errorText = await response.text().catch(e => 'Could not read error response');
          console.error(`KnowledgeBaseTab: API response not OK (${response.status}):`, errorText);
          throw new Error(`Failed to fetch course materials: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json()
        console.log(`KnowledgeBaseTab: Response data:`, data)
        
        if (!data.success) {
          console.error(`KnowledgeBaseTab: API returned success=false:`, data.error);
          throw new Error(data.error || 'Failed to fetch course materials')
        }
        
        // Map the database course materials to KnowledgeBaseItem format
        const knowledgeBaseItems = mapMaterialsToKnowledgeBase(data.materials)
        console.log(`KnowledgeBaseTab: Mapped ${knowledgeBaseItems.length} knowledge base items`)
        setItems(knowledgeBaseItems)
        
        // Update the context with the initial items (none selected by default)
        updateSelectedMaterials(knowledgeBaseItems)
        
        // If using mock data, add a console warning for developers
        if (data.isMockData) {
          console.warn('Using mock course materials data. Database connection may be unavailable.')
        }
      } catch (err: any) {
        console.error('Error fetching course materials:', err)
        let errorMessage = 'Unable to load course materials. Using offline mode.';
        
        // Add more detailed error info for debugging
        if (err.message) {
          errorMessage += ` Error: ${err.message}`;
        }
        
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMaterials()
  }, [courseId])

  const toggleItem = async (id: string) => {
    // Update the items list with the toggled item
    const updatedItems = items.map((item: KnowledgeBaseItem) => 
      item.id === id ? { ...item, isSelected: !item.isSelected } : item
    )
    setItems(updatedItems)
    
    // Log the selection change
    const toggledItem = updatedItems.find(item => item.id === id);
    if (toggledItem) {
      console.log(`\n=== Material Selection Changed ===`);
      console.log(`Material: ${toggledItem.title}`);
      console.log(`Material ID: ${toggledItem.id}`);
      console.log(`Course ID: ${toggledItem.courseId}`);
      console.log(`Selected: ${toggledItem.isSelected}`);
      console.log(`Total Selected: ${updatedItems.filter(item => item.isSelected).length}`);
      console.log(`==================================\n`);
    }
    
    // Update the context with selected materials
    updateSelectedMaterials(updatedItems)
    
    // Trigger auto-save when an item is toggled
    setIsSaving(true)
    try {
      // TODO: Replace with real API call to save selections
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLastSaved(new Date())
    } catch (err) {
      console.error('Error saving selections:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Replace with real API call to save selections
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLastSaved(new Date())
    } catch (err) {
      console.error('Error saving selections:', err)
    } finally {
      setIsSaving(false)
    }
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
    : items.filter((item: KnowledgeBaseItem) => item.type === filter)

  const selectedCount = items.filter((item: KnowledgeBaseItem) => item.isSelected).length

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
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">Loading course materials...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-4 space-y-2">
            <p className="text-sm text-amber-600 font-medium">{error}</p>
            <p className="text-xs text-gray-500">You can continue using the application while we resolve this issue.</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">No materials found for this course</p>
          </div>
        ) : (
          filteredItems.map((item: KnowledgeBaseItem) => (
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
        ))
        )}
      </div>

      {/* Auto-save Status Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            {isSaving ? (
              <span className="text-xs text-gray-500">Saving...</span>
            ) : lastSaved && (
              <span className="text-xs text-gray-500">
                Last saved: <span suppressHydrationWarning>{format(lastSaved, 'h:mm a')}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}