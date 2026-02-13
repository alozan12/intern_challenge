'use client'

import { useState } from 'react'
import { FlashcardSet } from '@/types'
import { X, Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FlashcardViewerProps {
  flashcardSet: FlashcardSet
  onClose?: () => void
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

export function FlashcardViewer({
  flashcardSet,
  onClose,
  isFullscreen = false,
  onToggleFullscreen
}: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  const cards = flashcardSet.content.cards
  const currentCard = cards[currentIndex]

  const handleNext = () => {
    setShowAnswer(false)
    setCurrentIndex((prev) => (prev + 1) % cards.length)
  }

  const handlePrevious = () => {
    setShowAnswer(false)
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
  }

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer)
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
            <h2 className="text-lg font-semibold text-gray-900">{flashcardSet.title}</h2>
            <p className="text-sm text-gray-600">
              Card {currentIndex + 1} of {cards.length}
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

      {/* Card Display */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div
          className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full mx-auto cursor-pointer transition-all transform hover:shadow-xl"
          style={{ 
            minHeight: '16rem',
            perspective: '1000px',
          }}
          onClick={toggleAnswer}
        >
          <div
            className="w-full h-full transition-transform duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: showAnswer ? 'rotateY(180deg)' : 'rotateY(0)',
            }}
          >
            <div 
              className="absolute w-full h-full backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <h3 className="text-xl font-semibold mb-4">Question</h3>
                <p className="text-lg text-center">{currentCard?.front || 'No question available'}</p>
                <div className="mt-8 text-sm text-gray-500">Click to see answer</div>
              </div>
            </div>
            <div
              className="absolute w-full h-full backface-hidden"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <h3 className="text-xl font-semibold mb-4">Answer</h3>
                <p className="text-lg text-center">{currentCard?.back || 'No answer available'}</p>
                <div className="mt-8 text-sm text-gray-500">Click to see question</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={handlePrevious}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </button>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {cards.length}
        </span>
        <button
          onClick={handleNext}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Next
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  )
}