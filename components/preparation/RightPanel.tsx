'use client'

import { useState } from 'react'
import { Plus, X, FileText, Brain, List, Lightbulb, HelpCircle, Filter, AlertCircle, BookOpen } from 'lucide-react'
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
  const [showContentFocusOptions, setShowContentFocusOptions] = useState(false)
  const [specificSections, setSpecificSections] = useState<string[]>([])
  const [selectedMaterialType, setSelectedMaterialType] = useState<StudyMaterial['type']>('flashcards')

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
    // Show content focus options instead of immediately creating
    setSelectedMaterialType(type)
    setShowContentFocusOptions(true)
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
      title: `${studyOptions.find(o => o.type === type)?.label}${focusLabel} - ${format(new Date(), 'MMM d')}`,
      content: {
        contentFocus,
        specificSections: contentFocus === 'specific_sections' ? specificSections : []
      },
      createdAt: new Date()
    }
    
    setCreatedMaterials(prev => [...prev, newMaterial])
    setShowContentFocusOptions(false)
    setContentFocus('all')
    setSpecificSections([])
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
      
      {/* Content Focus Options */}
      {showContentFocusOptions && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-sm text-gray-700">Content Focus:</h3>
            <button 
              onClick={() => setShowContentFocusOptions(false)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-all rounded-md hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <Tabs defaultValue="focus" className="w-full">
            <TabsList className="border-b border-gray-200 w-full pb-2 mb-3">
              <TabsTrigger 
                value="focus" 
                className="mr-4 px-1 py-0.5 border-b-2 data-[state=active]:border-asu-maroon data-[state=inactive]:border-transparent data-[state=active]:text-asu-maroon"
              >
                Content Focus
              </TabsTrigger>
              {contentFocus === 'specific_sections' && (
                <TabsTrigger 
                  value="sections" 
                  className="px-1 py-0.5 border-b-2 data-[state=active]:border-asu-maroon data-[state=inactive]:border-transparent data-[state=active]:text-asu-maroon"
                >
                  Select Sections
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="focus" className="space-y-2">
              {contentFocusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setContentFocus(option.value)}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-all border",
                    contentFocus === option.value
                      ? "border-asu-maroon bg-red-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-md",
                      contentFocus === option.value
                        ? "bg-red-100 text-asu-maroon"
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{option.label}</h4>
                      <p className="text-xs opacity-80 mt-0.5">{option.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </TabsContent>
            
            {contentFocus === 'specific_sections' && (
              <TabsContent value="sections" className="space-y-2">
                {courseSections.map((section) => (
                  <div
                    key={section.id}
                    onClick={() => toggleSection(section.id)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-all border flex items-center",
                      specificSections.includes(section.id)
                        ? "border-asu-maroon bg-red-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded mr-3 flex items-center justify-center border",
                      specificSections.includes(section.id)
                        ? "bg-asu-maroon border-asu-maroon text-white"
                        : "border-gray-300 bg-white"
                    )}>
                      {specificSections.includes(section.id) && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-sm">{section.title}</span>
                  </div>
                ))}
              </TabsContent>
            )}
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handleCreateFinalMaterial(selectedMaterialType)}
                className="px-4 py-2 bg-asu-maroon text-white rounded-lg hover:bg-red-900 transition-colors text-sm font-medium"
              >
                Generate Material
              </button>
            </div>
          </Tabs>
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
                      {format(material.createdAt, 'h:mm a')}
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