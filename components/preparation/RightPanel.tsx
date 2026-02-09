'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, X, FileText, Brain, Lightbulb, HelpCircle, Filter, AlertCircle, BookOpen, ChevronDown, Music } from 'lucide-react'
import { StudyMaterial } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { MultipleChoiceQuiz } from '@/components/study-materials/MultipleChoiceQuiz'
import { FlashcardSet } from '@/components/study-materials/FlashcardSet'
import { MusicPlayer } from '@/components/study-materials/MusicPlayer'
import { useViewMode } from '@/context/ViewModeContext'

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
type MusicGenreType = 'rap' | 'pop' | 'opera' | 'jazz' | 'rock' | 'retro'

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
    type: 'music',
    label: 'Study Music',
    description: 'Generate focus music based on your preferences',
    icon: <Music className="w-5 h-5" />,
    color: 'text-purple-600 bg-purple-50 hover:bg-purple-100'
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
  const [selectedGenre, setSelectedGenre] = useState<MusicGenreType>('pop')
  const [selectedMaterialType, setSelectedMaterialType] = useState<StudyMaterial['type'] | null>(null)
  const [showQuizInterface, setShowQuizInterface] = useState(false)
  const [showFlashcardInterface, setShowFlashcardInterface] = useState(false)
  const [showMusicInterface, setShowMusicInterface] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
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
  
  const handleCreateFinalMaterial = async (type: StudyMaterial['type']) => {
    setIsGenerating(true);
    
    // Mock creating a study material - replace with API call
    let focusLabel = '';
    
    if (contentFocus === 'knowledge_gaps') {
      focusLabel = ' (Knowledge Gaps)';
    } else if (contentFocus === 'specific_sections' && specificSections.length > 0) {
      focusLabel = ` (${specificSections.length} Sections)`;
    }
    
    // For music, add genre info to the label
    if (type === 'music') {
      focusLabel += ` (${selectedGenre.charAt(0).toUpperCase() + selectedGenre.slice(1)})`;
    }

    let content: any = {
      contentFocus,
      specificSections: contentFocus === 'specific_sections' ? specificSections : []
    }

    // Generate specific content based on material type
    if (type === 'quiz') {
      // Call API to generate quiz
      try {
        const response = await fetch('/api/study/quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            topic: 'Course Content', // You might want to make this dynamic
            courseId: courseId,
            courseName: 'Data Structures', // You might want to pass actual course data
            courseCode: 'CSE 110',
            questionCount: 10,
            difficulty: 'intermediate',
            generationType: contentFocus === 'knowledge_gaps' ? 'learning_gaps' : 'general_content',
            studentId: 'student-123' // Mock student ID
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate quiz');
        }
        
        const data = await response.json();
        
        if (data.quiz && data.quiz.content) {
          content = data.quiz.content;
        } else {
          throw new Error('No quiz returned from API');
        }
      } catch (error) {
        console.error('Error generating quiz:', error);
        // Fallback to empty content
        content = {
          ...content,
          questions: []
        };
      }
    } else if (type === 'flashcards') {
      // Call API to generate flashcards
      try {
        const response = await fetch('/api/study/flashcards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            topic: 'Course Content', // You might want to make this dynamic
            courseId: courseId,
            courseName: 'Data Structures', // You might want to pass actual course data
            courseCode: 'CSE 110',
            cardCount: 10,
            difficulty: 'intermediate',
            generationType: contentFocus === 'knowledge_gaps' ? 'learning_gaps' : 'general_content',
            studentId: 'student-123' // Mock student ID
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate flashcards');
        }
        
        const data = await response.json();
        
        if (data.flashcards && data.flashcards.content) {
          content = data.flashcards.content;
        } else {
          throw new Error('No flashcards returned from API');
        }
      } catch (error) {
        console.error('Error generating flashcards:', error);
        // Fallback to empty content
        content = {
          ...content,
          cards: []
        };
      }
      /*
      // Old hardcoded flashcards
            front: 'Dopamine',
            back: 'A neurotransmitter associated with pleasure, reward, and motivation. It plays a key role in the brain\'s reward system and is involved in addiction, movement, and emotional regulation.'
          },
          {
            id: '7',
            front: 'Confirmation Bias',
            back: 'The tendency to search for, interpret, favor, and recall information in a way that confirms one\'s preexisting beliefs while giving less consideration to alternative possibilities.'
          },
          {
            id: '8',
            front: 'Working Memory',
            back: 'The cognitive system responsible for temporarily holding information available for processing, manipulation, and decision-making. Has limited capacity and duration.'
          },
          {
            id: '9',
            front: 'Attribution Theory',
            back: 'Describes how individuals explain the causes of behavior and events, either attributing them to internal factors (personality, ability) or external factors (situation, luck).'
          },
          {
            id: '10',
            front: 'Serotonin',
            back: 'A neurotransmitter that regulates mood, social behavior, appetite, sleep, memory, and sexual desire. Often associated with feelings of well-being and happiness.'
          }
        ]
      }
      */
    } else if (type === 'music') {
      content = {
        ...content,
        genre: selectedGenre, // Use the selected genre
        tracks: [
          {
            id: '1',
            title: 'Study Flow Beats',
            artist: 'AI Generated',
            duration: 180,
            genre: 'rap',
            src: '/mock_assets/pythagorean.mp3'
          },
          {
            id: '2',
            title: 'Focus Pop Anthem',
            artist: 'Study Sounds',
            duration: 240,
            genre: 'pop',
            src: '/mock_assets/pythagorean.mp3'
          },
          {
            id: '3',
            title: 'Rock Your Studies',
            artist: 'Concentration Co.',
            duration: 200,
            genre: 'rock',
            src: '/mock_assets/pythagorean.mp3'
          }
        ]
      }
    }
    
    const newMaterial: StudyMaterial = {
      id: Date.now().toString(),
      type,
      title: `${studyOptions.find(o => o.type === type)?.label}${focusLabel} - ${format(new Date(), 'MMM d')}`,  // This is for material creation, not display
      content,
      createdAt: new Date()
    }
    
    setCreatedMaterials(prev => [...prev, newMaterial])
    // Reset the form
    setSelectedMaterialType(null)
    setContentFocus('all')
    setSpecificSections([])
    setSelectedGenre('pop')
    setShowFocusDropdown(false)
    setShowSectionsDropdown(false)
    setIsGenerating(false)
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

  const handleMaterialClick = (material: StudyMaterial) => {
    setSelectedMaterial(material.id)
    
    if (material.type === 'quiz') {
      setShowQuizInterface(true)
      setShowFlashcardInterface(false)
      setShowMusicInterface(false)
    } else if (material.type === 'flashcards') {
      setShowFlashcardInterface(true)
      setShowQuizInterface(false)
      setShowMusicInterface(false)
    } else if (material.type === 'music') {
      setShowMusicInterface(true)
      setShowQuizInterface(false)
      setShowFlashcardInterface(false)
    } else {
      setShowQuizInterface(false)
      setShowFlashcardInterface(false)
      setShowMusicInterface(false)
    }
  }

  const handleCloseQuiz = () => {
    setShowQuizInterface(false)
    setSelectedMaterial(null)
    setIsFullscreen(false)
  }

  const handleCloseFlashcards = () => {
    setShowFlashcardInterface(false)
    setSelectedMaterial(null)
    setIsFullscreen(false)
  }

  const handleCloseMusic = () => {
    setShowMusicInterface(false)
    setSelectedMaterial(null)
    setIsFullscreen(false)
  }

  const handleToggleFullscreen = () => {
    setIsFullscreen(prev => !prev)
  }

  const getMaterialIcon = (type: StudyMaterial['type']) => {
    return studyOptions.find(o => o.type === type)?.icon
  }

  const getMaterialColor = (type: StudyMaterial['type']) => {
    const option = studyOptions.find(o => o.type === type)
    return option?.color.split(' ')[0] || 'text-gray-600'
  }

  // Show quiz interface if a quiz is selected
  if (showQuizInterface && selectedMaterial) {
    const quizMaterial = createdMaterials.find(m => m.id === selectedMaterial && m.type === 'quiz')
    if (quizMaterial) {
      return (
        <MultipleChoiceQuiz
          quiz={quizMaterial as any}
          onClose={handleCloseQuiz}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onComplete={(results) => {
            console.log('Quiz completed:', results)
            // Here you could save results or show additional feedback
          }}
        />
      )
    }
  }

  // Show flashcard interface if flashcards are selected
  if (showFlashcardInterface && selectedMaterial) {
    const flashcardMaterial = createdMaterials.find(m => m.id === selectedMaterial && m.type === 'flashcards')
    if (flashcardMaterial) {
      return (
        <FlashcardSet
          flashcardSet={flashcardMaterial as any}
          onClose={handleCloseFlashcards}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onComplete={(results) => {
            console.log('Flashcards completed:', results)
            // Here you could save results or show additional feedback
          }}
        />
      )
    }
  }

  // Show music interface if music is selected
  if (showMusicInterface && selectedMaterial) {
    const musicMaterial = createdMaterials.find(m => m.id === selectedMaterial && m.type === 'music')
    if (musicMaterial) {
      return (
        <MusicPlayer
          musicSet={musicMaterial as any}
          onClose={handleCloseMusic}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        />
      )
    }
  }

  const { viewMode } = useViewMode();

  return (
    <div className={cn("flex flex-col h-full", viewMode === 'compact' ? 'text-sm' : '')}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900">Study Materials</h2>
          </div>
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
            
            {/* Music Genre Selection (only when Study Music is selected) */}
            {selectedMaterialType === 'music' && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">Music Genre</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'rap', label: 'Rap' },
                    { value: 'pop', label: 'Pop' },
                    { value: 'opera', label: 'Opera' },
                    { value: 'jazz', label: 'Jazz' },
                    { value: 'rock', label: 'Rock' },
                    { value: 'retro', label: 'Retro' }
                  ].map((genre) => (
                    <button
                      key={genre.value}
                      onClick={() => setSelectedGenre(genre.value as MusicGenreType)}
                      className={cn(
                        "px-3 py-1 text-sm rounded-full transition-colors",
                        selectedGenre === genre.value
                          ? "bg-purple-100 text-purple-700 border border-purple-300"
                          : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                      )}
                    >
                      {genre.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
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
                disabled={isGenerating}
                className="px-4 py-2 bg-asu-maroon text-white rounded-lg hover:bg-red-900 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Material'
                )}
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
                onClick={() => handleMaterialClick(material)}
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