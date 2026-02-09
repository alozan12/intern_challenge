'use client'

import { useState } from 'react'
import { Check, X, ChevronRight, ChevronLeft, RotateCcw, Brain, BookOpen, Maximize2, Minimize2, Eye, Edit3, AlertTriangle } from 'lucide-react'
import { FlashcardSet as FlashcardSetType } from '@/types'
import { cn } from '@/lib/utils'

interface FlashcardSetProps {
  flashcardSet: FlashcardSetType
  onComplete?: (results: FlashcardResults) => void
  onClose?: () => void
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

interface FlashcardResults {
  mode: 'study' | 'test'
  cardsReviewed: number
  correctAnswers: number
  timeSpent: number
  feedback: CardFeedback[]
}

interface CardFeedback {
  cardId: string
  userAnswer?: string
  isCorrect?: boolean
  aiScore?: number
  aiExplanation?: string
}

interface CardState {
  isFlipped: boolean
  userAnswer: string
  isAnswered: boolean
  isSubmitting?: boolean
  feedback?: CardFeedback
  error?: string
}

type StudyMode = 'study' | 'test'

// Mock flashcard data - this would normally come from an LLM API
const mockFlashcardData: FlashcardSetType = {
  id: 'mock-flashcard-1',
  type: 'flashcards',
  title: 'Psychology Key Terms - Flashcards',
  createdAt: new Date(),
  content: {
    cards: [
      {
        id: '1',
        front: 'Hippocampus',
        back: 'A region of the brain crucial for memory formation, consolidation, and spatial navigation. It converts short-term memories into long-term memories and is part of the limbic system.'
      },
      {
        id: '2',
        front: 'Classical Conditioning',
        back: 'A learning process where a neutral stimulus becomes associated with a meaningful stimulus, eventually triggering a similar response. Discovered by Ivan Pavlov through his experiments with dogs.'
      },
      {
        id: '3',
        front: 'Neuroplasticity',
        back: 'The brain\'s ability to reorganize and form new neural connections throughout life. This allows the brain to adapt to new experiences, learn new skills, and recover from injuries.'
      },
      {
        id: '4',
        front: 'Cognitive Dissonance',
        back: 'The mental discomfort experienced when holding contradictory beliefs, values, or attitudes simultaneously. People are motivated to reduce this dissonance by changing their beliefs or behaviors.'
      },
      {
        id: '5',
        front: 'Operant Conditioning',
        back: 'A learning method where behaviors are modified through consequences such as rewards and punishments. Developed by B.F. Skinner, it explains how voluntary behaviors are strengthened or weakened.'
      },
      {
        id: '6',
        front: 'Dopamine',
        back: 'A neurotransmitter associated with pleasure, reward, and motivation. It plays a key role in the brain\'s reward system and is involved in addiction, movement, and emotional regulation.'
      }
    ]
  }
}

// AI evaluation function that uses the CreateAI API
const evaluateWithAI = async (userAnswer: string, correctAnswer: string, term: string): Promise<CardFeedback> => {
  try {
    const response = await fetch('/api/study/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userAnswer,
        correctAnswer,
        term
      })
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return {
      cardId: '',
      userAnswer,
      isCorrect: data.isCorrect,
      aiScore: data.aiScore,
      aiExplanation: data.aiExplanation
    }
  } catch (error) {
    console.error('Error evaluating answer:', error)
    
    // Fallback in case API fails
    return {
      cardId: '',
      userAnswer,
      isCorrect: false,
      aiScore: 0,
      aiExplanation: 'Could not evaluate your answer. Please try again.'
    }
  }
}

export function FlashcardSet({ 
  flashcardSet = mockFlashcardData, 
  onComplete, 
  onClose, 
  isFullscreen = false, 
  onToggleFullscreen 
}: FlashcardSetProps) {
  const [mode, setMode] = useState<StudyMode>('study')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [cardStates, setCardStates] = useState<CardState[]>(
    flashcardSet.content.cards.map(() => ({
      isFlipped: false,
      userAnswer: '',
      isAnswered: false,
      isSubmitting: false
    }))
  )
  const [showResults, setShowResults] = useState(false)
  const [startTime] = useState(Date.now())
  const [showModeSelection, setShowModeSelection] = useState(true)

  const currentCard = flashcardSet.content.cards[currentCardIndex]
  const currentState = cardStates[currentCardIndex]
  const isLastCard = currentCardIndex === flashcardSet.content.cards.length - 1
  const completedCards = cardStates.filter(state => state.isAnswered).length

  const handleModeSelect = (selectedMode: StudyMode) => {
    setMode(selectedMode)
    setShowModeSelection(false)
    setCurrentCardIndex(0)
    setCardStates(flashcardSet.content.cards.map(() => ({
      isFlipped: false,
      userAnswer: '',
      isAnswered: false,
      isSubmitting: false
    })))
  }

  const handleFlipCard = () => {
    if (mode === 'study') {
      setCardStates(prev => prev.map((state, index) => 
        index === currentCardIndex
          ? { ...state, isFlipped: !state.isFlipped, isAnswered: true }
          : state
      ))
    }
  }

  const handleAnswerSubmit = async () => {
    if (mode === 'test' && currentState.userAnswer.trim()) {
      // Show loading state
      setCardStates(prev => prev.map((state, index) => 
        index === currentCardIndex
          ? { 
              ...state, 
              isSubmitting: true
            }
          : state
      ))
      
      try {
        // Get feedback from AI
        const feedback = await evaluateWithAI(currentState.userAnswer, currentCard.back, currentCard.front)
        
        setCardStates(prev => prev.map((state, index) => 
          index === currentCardIndex
            ? { 
                ...state, 
                isAnswered: true,
                isSubmitting: false,
                feedback: { ...feedback, cardId: currentCard.id } 
              }
            : state
        ))
      } catch (error) {
        console.error('Error submitting answer:', error)
        
        // Handle error
        setCardStates(prev => prev.map((state, index) => 
          index === currentCardIndex
            ? { 
                ...state, 
                isSubmitting: false,
                error: 'Failed to evaluate answer. Please try again.' 
              }
            : state
        ))
      }
    }
  }

  const handleUserAnswerChange = (answer: string) => {
    setCardStates(prev => prev.map((state, index) => 
      index === currentCardIndex
        ? { ...state, userAnswer: answer }
        : state
    ))
  }

  const handleNext = () => {
    if (isLastCard) {
      handleShowResults()
    } else {
      setCurrentCardIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1)
    }
  }

  const handleGoToCard = (index: number) => {
    setCurrentCardIndex(index)
    // Note: Card flip state is preserved in cardStates array
  }

  const handleShowResults = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    const correctAnswers = cardStates.filter(state => 
      mode === 'study' ? state.isAnswered : state.feedback?.isCorrect
    ).length
    
    const results: FlashcardResults = {
      mode,
      cardsReviewed: completedCards,
      correctAnswers,
      timeSpent,
      feedback: cardStates.map(state => state.feedback).filter(Boolean) as CardFeedback[]
    }

    setShowResults(true)
    onComplete?.(results)
  }

  const handleRestart = () => {
    setShowModeSelection(true)
    setCurrentCardIndex(0)
    setCardStates(flashcardSet.content.cards.map(() => ({
      isFlipped: false,
      userAnswer: '',
      isAnswered: false,
      isSubmitting: false
    })))
    setShowResults(false)
  }

  // Mode Selection Screen
  if (showModeSelection) {
    return (
      <div className={cn(
        "flex flex-col bg-white",
        isFullscreen ? "fixed inset-0 z-50 h-screen" : "h-full"
      )}>
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{flashcardSet.title}</h2>
            <div className="flex items-center gap-2">
              {onToggleFullscreen && (
                <button
                  onClick={onToggleFullscreen}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Choose Your Study Mode</h3>
              <p className="text-gray-600">Select how you'd like to review these {flashcardSet.content.cards.length} flashcards</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6">
              {/* Study Mode */}
              <button
                onClick={() => handleModeSelect('study')}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group text-left"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">Study Mode</h4>
                </div>
                <p className="text-gray-600 mb-1">
                  View flashcards with definitions visible
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Learn new concepts</li>
                  <li>• Flip cards to review</li>
                  <li>• Study at your own pace</li>
                </ul>
              </button>

              {/* Test Mode */}
              <button
                onClick={() => handleModeSelect('test')}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all group text-left"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <Brain className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">Test Mode</h4>
                </div>
                <p className="text-gray-600 mb-1">
                  Test yourself by writing definitions
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Type your answers</li>
                  <li>• Get AI feedback</li>
                  <li>• Track your progress</li>
                </ul>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Results Screen
  if (showResults) {
    const accuracy = mode === 'test' 
      ? Math.round((cardStates.filter(s => s.feedback?.isCorrect).length / Math.max(completedCards, 1)) * 100)
      : 100 // Study mode assumes all cards reviewed are "correct"
    
    return (
      <div className={cn(
        "flex flex-col bg-white",
        isFullscreen ? "fixed inset-0 z-50 h-screen" : "h-full"
      )}>
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Flashcard Results</h2>
            <div className="flex items-center gap-2">
              {onToggleFullscreen && (
                <button
                  onClick={onToggleFullscreen}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Results Summary */}
          <div className="text-center mb-8">
            <div className={cn(
              "w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold",
              accuracy >= 80 ? "bg-green-100 text-green-700" :
              accuracy >= 60 ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            )}>
              {accuracy}%
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {mode === 'study' ? 'Study Session Complete!' : 
               accuracy >= 80 ? 'Excellent work!' : 
               accuracy >= 60 ? 'Good effort!' : 'Keep practicing!'}
            </h3>
            <p className="text-gray-600">
              You reviewed {completedCards} out of {flashcardSet.content.cards.length} cards
              {mode === 'test' && ` with ${cardStates.filter(s => s.feedback?.isCorrect).length} correct answers`}
            </p>
          </div>

          {/* AI Insights */}
          {mode === 'test' && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">AI Study Insights</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    {accuracy >= 80 && <p>• Outstanding knowledge retention! You have a strong grasp of these concepts.</p>}
                    {accuracy < 80 && accuracy >= 60 && <p>• Solid foundation! Review the terms you found challenging for even better retention.</p>}
                    {accuracy < 60 && <p>• Focus on reviewing the definitions more thoroughly. Consider switching to Study Mode first.</p>}
                    <p>• Try explaining these concepts in your own words to deepen understanding</p>
                    <p>• Recommended: Review in 1 day, then 3 days, then 1 week for optimal retention</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Card Review */}
          {mode === 'test' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Detailed Feedback</h4>
              {flashcardSet.content.cards.map((card, index) => {
                const state = cardStates[index]
                if (!state.feedback) return null
                
                return (
                  <div key={card.id} className={cn(
                    "border rounded-lg p-4",
                    state.feedback.isCorrect ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"
                  )}>
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-1 rounded-full",
                        state.feedback.isCorrect ? "bg-green-600" : "bg-yellow-600"
                      )}>
                        {state.feedback.isCorrect ? 
                          <Check className="w-4 h-4 text-white" /> : 
                          <Brain className="w-4 h-4 text-white" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">{card.front}</p>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Your answer: </span>
                            <span className="text-gray-600">{state.userAnswer}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Score: </span>
                            <span className={cn(
                              "font-medium",
                              (state.feedback.aiScore ?? 0) >= 80 ? "text-green-600" :
                              (state.feedback.aiScore ?? 0) >= 60 ? "text-yellow-600" :
                              "text-red-600"
                            )}>
                              {state.feedback.aiScore}%
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Feedback: </span>
                            <span className="text-gray-600">{state.feedback.aiExplanation}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={handleRestart}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Study Again
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-asu-maroon text-white rounded-lg hover:bg-red-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  // Main Flashcard Interface
  return (
    <div className={cn(
      "flex flex-col bg-white",
      isFullscreen ? "fixed inset-0 z-50 h-screen" : "h-full"
    )}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{flashcardSet.title}</h2>
            <p className="text-sm text-gray-600">
              Card {currentCardIndex + 1} of {flashcardSet.content.cards.length} • 
              <span className="ml-1 capitalize">{mode} Mode</span>
              <span className="ml-1">
                {mode === 'study' && <Eye className="inline w-4 h-4" />}
                {mode === 'test' && <Edit3 className="inline w-4 h-4" />}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-asu-maroon h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedCards / flashcardSet.content.cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card Navigation Dots */}
      <div className="px-6 py-3 border-b border-gray-100">
        <div className="flex items-center justify-center gap-2">
          {flashcardSet.content.cards.map((_, index) => {
            const state = cardStates[index]
            const isCurrent = index === currentCardIndex
            
            return (
              <button
                key={index}
                onClick={() => handleGoToCard(index)}
                className={cn(
                  "w-8 h-8 rounded-full text-xs font-medium transition-all",
                  isCurrent
                    ? "bg-asu-maroon text-white"
                    : state.isAnswered
                      ? mode === 'study' 
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : state.feedback?.isCorrect
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* Flashcard Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Study Mode Instruction */}
          {mode === 'study' && !currentState.isFlipped && (
            <div className="text-center mb-6">
              <p className="text-gray-600">Click the card to reveal the definition</p>
            </div>
          )}

          {/* Card Container */}
          <div className="relative w-full h-[400px] perspective-1000">
            {mode === 'study' ? (
              // Study Mode: 3D Flip Card
              <div 
                className={cn(
                  "relative w-full h-full cursor-pointer preserve-3d transition-transform duration-700",
                  currentState.isFlipped && "rotate-y-180"
                )}
                onClick={handleFlipCard}
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Front of Card */}
                <div 
                  className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-asu-maroon to-red-800 rounded-xl shadow-lg flex items-center justify-center p-8"
                  style={{
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-white mb-4">{currentCard.front}</h3>
                    <p className="text-red-100 text-sm">Click to flip</p>
                  </div>
                </div>

                {/* Back of Card */}
                <div 
                  className="absolute inset-0 w-full h-full backface-hidden bg-white border-2 border-gray-200 rounded-xl shadow-lg flex items-center justify-center p-8 rotate-y-180"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="text-center">
                    <p className="text-lg text-gray-700 leading-relaxed">{currentCard.back}</p>
                    <p className="text-gray-400 text-sm mt-4">Click to flip back</p>
                  </div>
                </div>
              </div>
            ) : (
              // Test Mode: Text input
              <div className="w-full h-full bg-white border-2 border-gray-200 rounded-xl shadow-lg p-8 flex flex-col">
                {!currentState.isAnswered ? (
                  <div className="flex flex-col h-full">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-asu-maroon mb-2">{currentCard.front}</h3>
                      <p className="text-gray-600">What do you know about this term?</p>
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Write your definition:
                      </label>
                      <textarea
                        value={currentState.userAnswer}
                        onChange={(e) => handleUserAnswerChange(e.target.value)}
                        placeholder="Type your answer here..."
                        className="flex-1 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-asu-maroon focus:border-asu-maroon min-h-[120px]"
                      />
                      <div className="mt-4 text-center">
                        <button
                          onClick={handleAnswerSubmit}
                          disabled={!currentState.userAnswer.trim() || currentState.isSubmitting}
                          className={cn(
                            "px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 justify-center",
                            currentState.isSubmitting
                              ? "bg-gray-400 text-white cursor-wait"
                              : currentState.userAnswer.trim()
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          )}
                        >
                          {currentState.isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Evaluating...
                            </>
                          ) : (
                            'Submit Answer'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Show feedback after submission or error
                  <div className="flex flex-col h-full space-y-4 overflow-y-auto">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Your answer:</p>
                      <p className="text-gray-900">{currentState.userAnswer}</p>
                    </div>
                    
                    {currentState.error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1 rounded-full bg-red-600">
                            <AlertTriangle className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold text-gray-900">
                            Error
                          </span>
                        </div>
                        <p className="text-sm text-red-800 mb-3">
                          {currentState.error}
                        </p>
                        <button
                          onClick={handleAnswerSubmit}
                          className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    )}
                    
                    {currentState.feedback && (
                      <div className={cn(
                        "p-4 rounded-lg",
                        currentState.feedback.isCorrect ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"
                      )}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={cn(
                            "p-1 rounded-full",
                            currentState.feedback.isCorrect ? "bg-green-600" : "bg-yellow-600"
                          )}>
                            {currentState.feedback.isCorrect ? 
                              <Check className="w-4 h-4 text-white" /> : 
                              <Brain className="w-4 h-4 text-white" />
                            }
                          </div>
                          <span className="font-semibold text-gray-900">
                            Score: {currentState.feedback.aiScore}%
                          </span>
                        </div>
                        <p className={cn(
                          "text-sm mb-3",
                          currentState.feedback.isCorrect ? "text-green-800" : "text-yellow-800"
                        )}>
                          {currentState.feedback.aiExplanation}
                        </p>
                        <div className="p-3 bg-white rounded border">
                          <p className="text-sm text-gray-600 mb-1">Correct definition:</p>
                          <p className="text-sm text-gray-900">{currentCard.back}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
            className={cn(
              "flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
              currentCardIndex === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Next/Submit Button */}
          {mode === 'study' ? (
            currentState.isFlipped ? (
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-3 bg-asu-maroon text-white rounded-lg hover:bg-red-900 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {isLastCard ? "View Results" : "Next Card"}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex-1 px-4 py-3 text-center text-sm text-gray-500 bg-gray-50 rounded-lg">
                Flip the card to continue
              </div>
            )
          ) : (
            currentState.isAnswered ? (
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-3 bg-asu-maroon text-white rounded-lg hover:bg-red-900 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {isLastCard ? "View Results" : "Next Card"}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex-1 px-4 py-3 text-center text-sm text-gray-500 bg-gray-50 rounded-lg">
                Submit your answer to continue
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}