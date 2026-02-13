'use client'

import { useState } from 'react'
import { QuizSet } from '@/types'
import { X, Maximize2, Minimize2, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuizViewerProps {
  quizSet: QuizSet
  onClose?: () => void
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

export function QuizViewer({
  quizSet,
  onClose,
  isFullscreen = false,
  onToggleFullscreen
}: QuizViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const questions = quizSet.content.questions
  const currentQuestion = questions[currentIndex]

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      setQuizCompleted(true)
      return
    }
    
    setSelectedAnswer(null)
    setShowExplanation(false)
    setCurrentIndex((prev) => prev + 1)
  }

  const handlePrevious = () => {
    setSelectedAnswer(null)
    setShowExplanation(false)
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return // Prevent changing answer after selection
    
    setSelectedAnswer(index)
    if (index === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1)
    }
    setShowExplanation(true)
  }

  const restartQuiz = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setScore(0)
    setQuizCompleted(false)
  }

  // Quiz completion screen
  if (quizCompleted) {
    return (
      <div className={cn(
        "flex flex-col bg-white",
        isFullscreen ? "fixed inset-0 z-50 h-screen" : "h-full"
      )}>
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quiz Completed</h2>
              <p className="text-sm text-gray-600">
                Your score: {score} out of {questions.length}
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

        {/* Results Display */}
        <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full mx-auto text-center">
            <h3 className="text-2xl font-bold mb-6">Quiz Results</h3>
            
            <div className="mb-6">
              <div className="text-5xl font-bold mb-2">
                {Math.round((score / questions.length) * 100)}%
              </div>
              <div className="text-xl">
                You got {score} out of {questions.length} questions correct
              </div>
            </div>

            <div className="mb-8">
              {score === questions.length ? (
                <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                  <p className="font-medium">Perfect Score! Great job!</p>
                </div>
              ) : score >= questions.length * 0.7 ? (
                <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                  <p className="font-medium">Well done! You've mastered most of this material.</p>
                </div>
              ) : score >= questions.length * 0.5 ? (
                <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
                  <p className="font-medium">Good effort! Review the questions you missed to improve.</p>
                </div>
              ) : (
                <div className="p-4 bg-orange-50 text-orange-700 rounded-lg">
                  <p className="font-medium">Keep studying! Try the quiz again after reviewing the material.</p>
                </div>
              )}
            </div>
            
            <button
              onClick={restartQuiz}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Restart Quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex flex-col bg-white",
      isFullscreen ? "fixed inset-0 z-50 h-screen" : "h-full"
    )}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{quizSet.title}</h2>
            <p className="text-sm text-gray-600">
              Question {currentIndex + 1} of {questions.length}
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

      {/* Question Display */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-6">{currentQuestion?.question || 'No question available'}</h3>
          
          {/* Answer Options */}
          <div className="space-y-4">
            {currentQuestion?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-all",
                  selectedAnswer === null ? 
                    "border-gray-200 hover:border-gray-300 hover:bg-gray-50" : 
                    selectedAnswer === index ? 
                      (index === currentQuestion.correctAnswer ? 
                        "border-green-500 bg-green-50" : 
                        "border-red-500 bg-red-50") : 
                      index === currentQuestion.correctAnswer ?
                        "border-green-500 bg-green-50" : 
                        "border-gray-200 opacity-60"
                )}
                disabled={selectedAnswer !== null}
              >
                <div className="flex items-center">
                  <span className="flex-1">{option}</span>
                  {selectedAnswer !== null && (
                    index === currentQuestion.correctAnswer ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> : 
                      selectedAnswer === index ?
                        <XCircle className="w-5 h-5 text-red-600" /> :
                        null
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Explanation */}
          {showExplanation && currentQuestion?.explanation && (
            <div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-lg">
              <h4 className="font-semibold mb-1">Explanation:</h4>
              <p>{currentQuestion.explanation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={handlePrevious}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </button>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {questions.length}
        </span>
        <button
          onClick={handleNext}
          className={cn(
            "flex items-center px-4 py-2 rounded-md",
            selectedAnswer !== null ?
              "bg-purple-600 text-white hover:bg-purple-700" :
              "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
          disabled={selectedAnswer === null}
        >
          {currentIndex === questions.length - 1 ? "Finish" : "Next"}
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  )
}