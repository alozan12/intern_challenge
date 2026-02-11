'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { FlashcardSet } from '@/components/study-materials/FlashcardSet'
import { FlashcardGenerator } from '@/components/study-materials/FlashcardGenerator'
import { Course, FlashcardSet as FlashcardSetType } from '@/types'
import { BookOpen, Book, FlaskConical, Zap, Brain, Files, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data for study materials (in a real app, this would come from an API)
const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Introduction to Computer Science',
    code: 'CSE 110',
    color: '#8C1D40',
    progress: 78,
    upcomingDeadlines: [],
    weakTopics: ['Binary Search Trees', 'Heap Operations', 'Time Complexity Analysis'],
    upcomingTopics: ['Graph Algorithms', 'Linked Lists']
  },
  {
    id: '2',
    name: 'Calculus I',
    code: 'MAT 265',
    color: '#FF6900',
    progress: 65,
    upcomingDeadlines: [],
    weakTopics: ['Integration by Parts', 'Improper Integrals', 'Applications of Integration'],
    upcomingTopics: ['Series and Sequences', 'Convergence Tests']
  },
  {
    id: '3',
    name: 'English Composition',
    code: 'ENG 101',
    color: '#00A3E0',
    progress: 82,
    upcomingDeadlines: [],
    weakTopics: ['In-text Citations', 'Argumentative Structure'],
    upcomingTopics: ['Rhetorical Analysis', 'Literary Criticism']
  }
]

// Mock flashcard sets
const mockFlashcardSets: FlashcardSetType[] = [
  {
    id: 'cs-flashcards-1',
    type: 'flashcards',
    title: 'Data Structures - Key Concepts',
    createdAt: new Date(),
    content: {
      cards: [
        {
          id: 'cs-1',
          front: 'Array',
          back: 'A collection of elements stored at contiguous memory locations. Elements can be accessed using an index. Provides O(1) access time but O(n) insertion/deletion time for arbitrary positions.'
        },
        {
          id: 'cs-2',
          front: 'Linked List',
          back: 'A linear data structure where elements are not stored at contiguous memory locations. Each element (node) contains data and a reference to the next node. Provides O(1) insertion/deletion time but O(n) access time.'
        },
        {
          id: 'cs-3',
          front: 'Binary Search Tree',
          back: 'A tree data structure where each node has at most two children (left and right). For each node, all elements in the left subtree are less than the node, and all elements in the right subtree are greater. Provides O(log n) search, insertion, and deletion time on average.'
        },
        {
          id: 'cs-4',
          front: 'Stack',
          back: 'A linear data structure that follows the Last In First Out (LIFO) principle. The last element added is the first one to be removed. Common operations include push, pop, and peek.'
        }
      ]
    }
  },
  {
    id: 'math-flashcards-1',
    type: 'flashcards',
    title: 'Calculus - Integration Techniques',
    createdAt: new Date(),
    content: {
      cards: [
        {
          id: 'math-1',
          front: 'Integration by Parts',
          back: 'A technique used when integrating the product of two functions. It is based on the product rule for differentiation and uses the formula: ∫u(x)v′(x)dx = u(x)v(x) − ∫v(x)u′(x)dx'
        },
        {
          id: 'math-2',
          front: 'U-Substitution',
          back: 'A method of finding an antiderivative by substituting a new variable for a part of the integrand. If u = g(x), then dx = du/g\'(x), and the integral can be rewritten in terms of u.'
        },
        {
          id: 'math-3',
          front: 'Improper Integrals',
          back: 'Integrals that have one or more infinite limits of integration or integrands with vertical asymptotes in the interval of integration. They are evaluated as limits of proper integrals.'
        }
      ]
    }
  },
  {
    id: 'eng-flashcards-1',
    type: 'flashcards',
    title: 'English - Citation Styles',
    createdAt: new Date(),
    content: {
      cards: [
        {
          id: 'eng-1',
          front: 'APA In-text Citation',
          back: 'Includes the author\'s last name and the year of publication in parentheses (Smith, 2020). For direct quotes, include the page number: (Smith, 2020, p. 25).'
        },
        {
          id: 'eng-2',
          front: 'MLA In-text Citation',
          back: 'Includes the author\'s last name and the page number in parentheses (Smith 25). No comma between name and page number.'
        },
        {
          id: 'eng-3',
          front: 'Chicago Style In-text Citation',
          back: 'Uses footnotes or endnotes with superscript numbers in the text. Full citation appears in the note. Subsequent citations can be shortened.'
        }
      ]
    }
  }
]

// Study mode page component
export default function StudyPage() {
  // Get course and topic from query parameters
  const searchParams = useSearchParams()
  const courseId = searchParams.get('course') || ''
  const topic = searchParams.get('topic') || ''
  
  // State for active course and selected flashcard set
  const [activeCourseId, setActiveCourseId] = useState(courseId || mockCourses[0].id)
  const [selectedFlashcardSet, setSelectedFlashcardSet] = useState<FlashcardSetType | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  
  // Filter courses and flashcard sets based on active course
  const activeCourse = mockCourses.find(course => course.id === activeCourseId) || mockCourses[0]
  const courseFlashcards = mockFlashcardSets.filter(set => {
    if (activeCourseId === '1') return set.id.startsWith('cs')
    if (activeCourseId === '2') return set.id.startsWith('math')
    if (activeCourseId === '3') return set.id.startsWith('eng')
    return false
  })
  
  // Handle flashcard set selection
  const handleSelectFlashcardSet = (set: FlashcardSetType) => {
    setSelectedFlashcardSet(set)
  }
  
  // Handle flashcard completion
  const handleFlashcardComplete = (results: any) => {
    console.log('Flashcard session completed with results:', results)
    // In a real app, you would save these results to the backend
  }
  
  // Toggle fullscreen for flashcards
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }
  
  // Close flashcard set
  const closeFlashcardSet = () => {
    setSelectedFlashcardSet(null)
    setIsFullscreen(false)
  }
  
  // Toggle flashcard generator
  const toggleFlashcardGenerator = () => {
    setShowGenerator(!showGenerator)
  }
  
  // Close flashcard generator
  const closeFlashcardGenerator = () => {
    setShowGenerator(false)
  }

  return (
    <div className="p-4 max-w-screen-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Study Materials</h1>
        <p className="text-gray-600">
          Select a course and study material type to begin studying
        </p>
      </div>
      
      {/* Course Tabs */}
      <Tabs defaultValue={activeCourseId} onValueChange={setActiveCourseId}>
        <TabsList className="mb-4">
          {mockCourses.map(course => (
            <TabsTrigger 
              key={course.id} 
              value={course.id}
              className={cn(
                "data-[state=active]:shadow-sm",
                course.id === activeCourseId && "text-white"
              )}
            >
              <span
                style={{
                  backgroundColor: course.id === activeCourseId ? course.color : 'transparent',
                  color: course.id === activeCourseId ? 'white' : 'inherit',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  display: 'block'
                }}
              >
                {course.code}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* Course Content */}
        {mockCourses.map(course => (
          <TabsContent key={course.id} value={course.id}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Course Info */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{course.name}</h2>
                  
                  {/* Topics */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Focus Areas</h3>
                    <ul className="space-y-2">
                      {course.weakTopics?.map(topic => (
                        <li key={topic} className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-gray-600">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Upcoming Topics */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Upcoming Topics</h3>
                    <ul className="space-y-2">
                      {course.upcomingTopics?.map(topic => (
                        <li key={topic} className="flex items-center gap-2">
                          <Book className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-600">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Right Column: Study Materials */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Materials</h2>
                  
                  {/* Material Types */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <button className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900">Flashcards</h3>
                        <p className="text-sm text-gray-600">Test your knowledge of key terms</p>
                      </div>
                    </button>
                    
                    <button className="p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FlaskConical className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900">Practice Questions</h3>
                        <p className="text-sm text-gray-600">Apply concepts with sample problems</p>
                      </div>
                    </button>
                  </div>
                  
                  {/* Flashcard Sets */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">Available Flashcard Sets</h3>
                      <button
                        onClick={toggleFlashcardGenerator}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-md flex items-center gap-1 hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Create
                      </button>
                    </div>
                    <div className="space-y-3">
                      {courseFlashcards.map(set => (
                        <button
                          key={set.id}
                          onClick={() => handleSelectFlashcardSet(set)}
                          className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Brain className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-left">
                              <h4 className="font-medium text-gray-900">{set.title}</h4>
                              <p className="text-sm text-gray-600">{set.content.cards.length} cards</p>
                            </div>
                          </div>
                          <span className="text-sm text-blue-600">Study Now</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Flashcard Set Modal */}
      {selectedFlashcardSet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`bg-white rounded-lg shadow-xl ${isFullscreen ? 'w-full h-full' : 'max-w-4xl w-full max-h-[90vh]'}`}>
            <FlashcardSet 
              flashcardSet={selectedFlashcardSet}
              onComplete={handleFlashcardComplete}
              onClose={closeFlashcardSet}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
            />
          </div>
        </div>
      )}
      
      {/* Flashcard Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="max-w-2xl w-full max-h-[90vh]">
            <FlashcardGenerator
              course={activeCourse}
              initialTopic={topic || activeCourse.weakTopics?.[0]}
              onClose={closeFlashcardGenerator}
            />
          </div>
        </div>
      )}
    </div>
  )
}