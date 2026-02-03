'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, X, FileText, Brain, List, Lightbulb, HelpCircle, Filter, AlertCircle, BookOpen, ChevronDown } from 'lucide-react'
import { StudyMaterial } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'

interface RightPanelProps {
  courseId: string
}

interface StudyOption {
  type: StudyMaterial['type']
  label: string
  description: string
  icon: React.ReactNode
  color: string
}

type ContentFocus = 'all' | 'knowledge_gaps' | 'specific_sections'

interface ContentFocusOption {
  value: ContentFocus
  label: string
  description: string
  icon: React.ReactNode
}

const studyOptions: StudyOption[] = [
  {
    type: 'flashcards',
    label: 'Flashcards',
    description: 'Create interactive flashcards for quick review',
    icon: <FileText className="w-5 h-5" />,
    color: 'text-blue-600 bg-blue-50 hover:bg-blue-100'
  },
  {
    type: 'quiz',
    label: 'Practice Quiz',
    description: 'Generate a quiz to test your knowledge',
    icon: <HelpCircle className="w-5 h-5" />,
    color: 'text-green-600 bg-green-50 hover:bg-green-100'
  },
  {
    type: 'summary',
    label: 'Study Summary',
    description: 'Get a concise summary of key concepts',
    icon: <Brain className="w-5 h-5" />,
    color: 'text-purple-600 bg-purple-50 hover:bg-purple-100'
  },
  {
    type: 'outline',
    label: 'Study Outline',
    description: 'Create a structured outline of topics',
    icon: <List className="w-5 h-5" />,
    color: 'text-orange-600 bg-orange-50 hover:bg-orange-100'
  },
  {
    type: 'practice_problems',
    label: 'Practice Problems',
    description: 'Generate practice problems with solutions',
    icon: <Lightbulb className="w-5 h-5" />,
    color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
  }
]

export function RightPanel({ courseId }: RightPanelProps) {
  const [showOptions, setShowOptions] = useState(false)
  const [createdMaterials, setCreatedMaterials] = useState<StudyMaterial[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)
  const [contentFocus, setContentFocus] = useState<ContentFocus>('all')
  const [showFocusDropdown, setShowFocusDropdown] = useState(false)
  const [showSectionsDropdown, setShowSectionsDropdown] = useState(false)
  const [specificSections, setSpecificSections] = useState<string[]>([])
  const [selectedMaterialType, setSelectedMaterialType] = useState<StudyMaterial['type'] | null>(null)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFocusDropdown(false)
        setShowSectionsDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const contentFocusOptions: ContentFocusOption[] = [
    {
      value: 'all',
      label: 'All Content',
      description: 'Generate materials covering all course content',
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      value: 'knowledge_gaps',
      label: 'Knowledge Gaps',
      description: 'Focus on areas where you need improvement',
      icon: <AlertCircle className="w-5 h-5" />
    },
    {
      value: 'specific_sections',
      label: 'Specific Sections',
      description: 'Select specific topics or modules to focus on',
      icon: <Filter className="w-5 h-5" />
    }
  ]

  // Mock course sections - in real app would come from API
  const courseSections = [
    { id: 's1', title: 'Module 1: Introduction' },
    { id: 's2', title: 'Module 2: Core Concepts' },
    { id: 's3', title: 'Module 3: Advanced Topics' },
    { id: 's4', title: 'Module 4: Practical Applications' },
    { id: 's5', title: 'Module 5: Case Studies' },
  ]

  const handleCreateMaterial = (type: StudyMaterial['type']) => {
    setSelectedMaterialType(type)
    setShowOptions(false)
  }
  
  const handleCreateFinalMaterial = (type: StudyMaterial['type']) => {
    // Mock creating a study material - replace with API call
    let focusLabel = '';
    
    if (contentFocus === 'knowledge_gaps') {
      focusLabel = ' (Knowledge Gaps)';
    } else if (contentFocus === 'specific_sections' && specificSections.length > 0) {
      focusLabel = ` (${specificSections.length} Sections)`;
    }
    
    const newMaterial: StudyMaterial = {
      id: Date.now().toString(),
      type,
      title: `${studyOptions.find(o => o.type === type)?.label}${focusLabel} - ${format(new Date(), 'MMM d')}`,  // This is for material creation, not display
      content: {
        contentFocus,
        specificSections: contentFocus === 'specific_sections' ? specificSections : []
      },
      createdAt: new Date()
    }
    
    setCreatedMaterials(prev => [...prev, newMaterial])
    // Reset the form
    setSelectedMaterialType(null)
    setContentFocus('all')
    setSpecificSections([])
    setShowFocusDropdown(false)
    setShowSectionsDropdown(false)
  }
  
  const toggleSection = (sectionId: string) => {
    setSpecificSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId) 
        : [...prev, sectionId]
    )
  }

  const handleDeleteMaterial = (id: string) => {
    setCreatedMaterials(prev => prev.filter(m => m.id !== id))
    if (selectedMaterial === id) {
      setSelectedMaterial(null)
    }
  }

  const getMaterialIcon = (type: StudyMaterial['type']) => {
    return studyOptions.find(o => o.type === type)?.icon
  }

  const getMaterialColor = (type: StudyMaterial['type']) => {
    const option = studyOptions.find(o => o.type === type)
    return option?.color.split(' ')[0] || 'text-gray-600'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Study Materials</h2>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className={cn(
              "p-2 rounded-lg transition-all",
              showOptions
                ? "bg-gray-200 text-gray-700 rotate-45"
                : "bg-asu-maroon text-white hover:bg-red-900"
            )}
          >
            <Plus className="w-5 h-5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Material Type Options Menu */}
      {showOptions && (
        <div className="border-b border-gray-200 p-4 space-y-2 bg-gray-50">
          <h3 className="font-medium text-sm mb-2 text-gray-700">Select material type:</h3>
          {studyOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => handleCreateMaterial(option.type)}
              className={cn(
                "w-full p-3 rounded-lg text-left transition-all group",
                option.color
              )}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-white/50">
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{option.label}</h4>
                  <p className="text-xs opacity-80 mt-0.5">{option.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Material Creation Interface with Integrated Dropdowns */}
      {!showOptions && selectedMaterialType && (
        <div ref={dropdownRef} className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-2 rounded-md",
                  studyOptions.find(o => o.type === selectedMaterialType)?.color.split(' ').slice(0, 2).join(' ')
                )}>
                  {studyOptions.find(o => o.type === selectedMaterialType)?.icon}
                </div>
                <div>
                  <h3 className="font-medium text-sm">{studyOptions.find(o => o.type === selectedMaterialType)?.label}</h3>
                  <p className="text-xs text-gray-500">Configure your study material</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMaterialType(null)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-all rounded-md hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Content Focus Dropdown */}
            <div className="relative">
              <div className="text-xs text-gray-500 mb-1">Content Focus</div>
              <div 
                className="border border-gray-300 rounded-md p-2 flex justify-between items-center cursor-pointer hover:border-gray-400"
                onClick={() => setShowFocusDropdown(!showFocusDropdown)}
              >
                <div className="flex items-center gap-2">
                  <div className="text-gray-600">
                    {contentFocusOptions.find(o => o.value === contentFocus)?.icon}
                  </div>
                  <span className="text-sm">{contentFocusOptions.find(o => o.value === contentFocus)?.label}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
              
              {showFocusDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                  {contentFocusOptions.map((option) => (
                    <div
                      key={option.value}
                      className={cn(
                        "flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer",
                        contentFocus === option.value ? "bg-red-50" : ""
                      )}
                      onClick={() => {
                        setContentFocus(option.value)
                        setShowFocusDropdown(false)
                        // If specific sections is selected, open the sections dropdown
                        if (option.value === 'specific_sections') {
                          setTimeout(() => setShowSectionsDropdown(true), 100)
                        }
                      }}
                    >
                      <div className={cn(
                        "text-gray-600",
                        contentFocus === option.value ? "text-asu-maroon" : ""
                      )}>
                        {option.icon}
                      </div>
                      <div>
                        <div className={cn(
                          "text-sm",
                          contentFocus === option.value ? "font-medium text-asu-maroon" : ""
                        )}>
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Specific Sections Dropdown (only when 'specific_sections' is selected) */}
            {contentFocus === 'specific_sections' && (
              <div className="relative">
                <div className="text-xs text-gray-500 mb-1">Selected Sections ({specificSections.length})</div>
                <div 
                  className="border border-gray-300 rounded-md p-2 flex justify-between items-center cursor-pointer hover:border-gray-400"
                  onClick={() => setShowSectionsDropdown(!showSectionsDropdown)}
                >
                  <span className="text-sm">
                    {specificSections.length === 0 
                      ? "Select sections" 
                      : `${specificSections.length} section${specificSections.length > 1 ? 's' : ''} selected`}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
                
                {showSectionsDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {courseSections.map((section) => (
                      <div
                        key={section.id}
                        className={cn(
                          "flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer",
                          specificSections.includes(section.id) ? "bg-red-50" : ""
                        )}
                        onClick={() => toggleSection(section.id)}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center",
                          specificSections.includes(section.id) 
                            ? "bg-asu-maroon border-asu-maroon text-white" 
                            : "border-gray-300"
                        )}>
                          {specificSections.includes(section.id) && (
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <span className="text-sm">{section.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Generate Button */}
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => handleCreateFinalMaterial(selectedMaterialType)}
                className="px-4 py-2 bg-asu-maroon text-white rounded-lg hover:bg-red-900 transition-colors text-sm font-medium"
              >
                Generate Material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Created Materials List */}
      <div className="flex-1 overflow-y-auto p-4">
        {createdMaterials.length > 0 ? (
          <div className="space-y-2">
            {createdMaterials.map((material) => (
              <div
                key={material.id}
                onClick={() => setSelectedMaterial(material.id)}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all group",
                  selectedMaterial === material.id
                    ? "border-asu-maroon bg-red-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-md bg-white", getMaterialColor(material.type))}>
                    {getMaterialIcon(material.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">
                      {material.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      <span suppressHydrationWarning>{format(material.createdAt, 'h:mm a')}</span>
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteMaterial(material.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-center px-4">
            <div>
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                No study materials yet
              </h3>
              <p className="text-xs text-gray-500">
                Click the + button to create flashcards, quizzes, and more
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <p className="text-xs text-gray-600 text-center">
          Created materials are saved to your session
        </p>
      </div>
    </div>
  )
}