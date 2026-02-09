'use client'

import { useState } from 'react'
import { FlashcardSet } from '@/components/study-materials/FlashcardSet'
import { FlashcardSet as FlashcardSetType, Course } from '@/types'
import { Loader2, Brain, X, AlertTriangle, Target, Book } from 'lucide-react'

interface FlashcardGeneratorProps {
  course?: Course
  initialTopic?: string
  onClose: () => void
  onGenerate?: (flashcardSet: FlashcardSetType) => void
}

export function FlashcardGenerator({ course, initialTopic, onClose, onGenerate }: FlashcardGeneratorProps) {
  const [topic, setTopic] = useState(initialTopic || '')
  const [cardCount, setCardCount] = useState(5)
  const [difficulty, setDifficulty] = useState<'basic' | 'intermediate' | 'advanced'>('intermediate')
  const [generationType, setGenerationType] = useState<'general_content' | 'learning_gaps'>('general_content')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSetType | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Generate flashcards
  const handleGenerateFlashcards = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      console.log('Generating flashcards for:', topic, generationType);
      const response = await fetch('/api/study/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic,
          courseId: course?.id,
          courseName: course?.name,
          courseCode: course?.code,
          cardCount,
          difficulty,
          generationType,
          studentId: 'mock-student-123' // Mock student ID for demonstration
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to generate flashcards: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.flashcards) {
        throw new Error('No flashcards returned from API');
      }
      
      console.log('Received flashcards from API:', data.flashcards);
      setFlashcardSet(data.flashcards)
      
      // Call the onGenerate callback if provided
      if (onGenerate && data.flashcards) {
        onGenerate(data.flashcards);
      }
    } catch (err) {
      console.error('Error generating flashcards:', err)
      let errorMessage = 'Failed to generate flashcards. Please try again.'
      
      // Try to extract more detailed error information
      if (err instanceof Error) {
        errorMessage = err.message
      }
      
      // Show the error to the user
      setError(`Error: ${errorMessage}`)
      
      // Log additional debug info
      console.log('Error details:', { 
        error: err, 
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Handle flashcard completion
  const handleFlashcardComplete = (results: any) => {
    console.log('Flashcard session completed with results:', results)
    // In a real app, you would save these results to the backend
  }
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }
  
  // Reset the generator
  const handleReset = () => {
    setFlashcardSet(null)
  }

  return (
    <div className={`bg-white rounded-lg shadow-xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {flashcardSet ? flashcardSet.title : 'Generate Flashcards'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {flashcardSet ? (
          <FlashcardSet
            flashcardSet={flashcardSet}
            onComplete={handleFlashcardComplete}
            onClose={handleReset}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
        ) : (
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Generate customized flashcards for your study session. Enter a specific topic to get started.
              </p>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              <div className="space-y-4">
                {/* Topic Input */}
                <div>
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                    Topic *
                  </label>
                  <input
                    type="text"
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a specific topic (e.g., Binary Search Trees)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
                
                {/* Generation Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flashcard Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGenerationType('general_content')}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                        generationType === 'general_content'
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      disabled={loading}
                    >
                      <Book className="w-4 h-4" />
                      General Content
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenerationType('learning_gaps')}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                        generationType === 'learning_gaps'
                          ? 'bg-green-100 border-green-300 text-green-800'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      disabled={loading}
                    >
                      <Target className="w-4 h-4" />
                      Learning Gaps
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {generationType === 'learning_gaps' ? 
                      'Focus on addressing misconceptions and difficult concepts' : 
                      'Cover general knowledge about the topic'}
                  </p>
                </div>

                {/* Card Count */}
                <div>
                  <label htmlFor="cardCount" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Cards
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      id="cardCount"
                      min="3"
                      max="10"
                      value={cardCount}
                      onChange={(e) => setCardCount(parseInt(e.target.value))}
                      className="flex-1"
                      disabled={loading}
                    />
                    <span className="text-sm font-medium text-gray-900 w-8 text-center">{cardCount}</span>
                  </div>
                </div>
                
                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDifficulty('basic')}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        difficulty === 'basic'
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      disabled={loading}
                    >
                      Basic
                    </button>
                    <button
                      type="button"
                      onClick={() => setDifficulty('intermediate')}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        difficulty === 'intermediate'
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      disabled={loading}
                    >
                      Intermediate
                    </button>
                    <button
                      type="button"
                      onClick={() => setDifficulty('advanced')}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        difficulty === 'advanced'
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      disabled={loading}
                    >
                      Advanced
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Generate Button */}
            <div className="flex justify-center">
              <button
                onClick={handleGenerateFlashcards}
                disabled={loading || !topic.trim()}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  loading || !topic.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Generate Flashcards
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}