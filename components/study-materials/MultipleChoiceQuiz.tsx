'use client'

import { useState } from 'react'
import { Check, X, ChevronRight, ChevronLeft, RotateCcw, TrendingUp, Maximize2, Minimize2 } from 'lucide-react'
import { QuizSet } from '@/types'
import { cn } from '@/lib/utils'

interface MultipleChoiceQuizProps {
  quiz: QuizSet
  onComplete?: (results: QuizResults) => void
  onClose?: () => void
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

interface QuizResults {
  score: number
  totalQuestions: number
  correctAnswers: number[]
  userAnswers: (number | null)[]
  timeSpent: number
}

interface QuestionState {
  selectedAnswer: number | null
  isAnswered: boolean
  isCorrect: boolean
  showFeedback: boolean
}

// Mock quiz data - this would normally come from an LLM API
const mockQuizData: QuizSet = {
  id: 'mock-quiz-1',
  type: 'quiz',
  title: 'Introduction to Psychology - Practice Quiz',
  createdAt: new Date(),
  content: {
    questions: [
      {
        id: '1',
        question: 'What is the primary function of the hippocampus in the brain?',
        options: [
          'Regulating body temperature',
          'Processing visual information',
          'Memory formation and retrieval',
          'Controlling motor functions'
        ],
        correctAnswer: 2,
        explanation: 'The hippocampus is crucial for forming new memories and retrieving existing ones. It plays a key role in converting short-term memories to long-term storage and spatial navigation.'
      },
      {
        id: '2',
        question: 'Which psychological approach emphasizes the role of unconscious thoughts and childhood experiences?',
        options: [
          'Behaviorism',
          'Cognitive Psychology',
          'Psychoanalytic Theory',
          'Humanistic Psychology'
        ],
        correctAnswer: 2,
        explanation: 'Psychoanalytic theory, developed by Freud, focuses on unconscious drives, repressed memories, and early childhood experiences as primary influences on behavior and personality.'
      },
      {
        id: '3',
        question: 'In classical conditioning, what is the unconditioned response (UCR)?',
        options: [
          'A learned response to a conditioned stimulus',
          'A neutral stimulus before conditioning',
          'A natural, automatic response to an unconditioned stimulus',
          'The process of learning new associations'
        ],
        correctAnswer: 2,
        explanation: 'The unconditioned response (UCR) is an automatic, natural reaction that occurs in response to an unconditioned stimulus without any prior learning or conditioning required.'
      },
      {
        id: '4',
        question: 'What does the term "neuroplasticity" refer to?',
        options: [
          'The brain\'s ability to change and adapt throughout life',
          'The process of neuron death in aging',
          'The brain\'s electrical activity patterns',
          'The physical structure of neural networks'
        ],
        correctAnswer: 0,
        explanation: 'Neuroplasticity refers to the brain\'s remarkable ability to reorganize, form new neural connections, and adapt throughout an individual\'s lifetime in response to learning, experience, or injury.'
      },
      {
        id: '5',
        question: 'Which research method allows psychologists to determine cause-and-effect relationships?',
        options: [
          'Correlational studies',
          'Case studies',
          'Experimental studies',
          'Observational studies'
        ],
        correctAnswer: 2,
        explanation: 'Experimental studies use controlled conditions with independent and dependent variables, allowing researchers to establish causal relationships by manipulating one variable and observing its effect on another.'
      }
    ]
  }
}

export function MultipleChoiceQuiz({ quiz = mockQuizData, onComplete, onClose, isFullscreen = false, onToggleFullscreen }: MultipleChoiceQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(
    quiz.content.questions.map(() => ({
      selectedAnswer: null,
      isAnswered: false,
      isCorrect: false,
      showFeedback: false
    }))
  )
  const [showResults, setShowResults] = useState(false)
  const [startTime] = useState(Date.now())

  const currentQuestion = quiz.content.questions[currentQuestionIndex]
  const currentState = questionStates[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.content.questions.length - 1
  const allQuestionsAnswered = questionStates.every(state => state.isAnswered)

  const handleAnswerSelect = (answerIndex: number) => {
    if (currentState.isAnswered) return

    const isCorrect = answerIndex === currentQuestion.correctAnswer
    
    setQuestionStates(prev => prev.map((state, index) => 
      index === currentQuestionIndex
        ? {
            ...state,
            selectedAnswer: answerIndex,
            isAnswered: true,
            isCorrect,
            showFeedback: true
          }
        : state
    ))
  }

  const handleNext = () => {
    if (isLastQuestion) {
      handleShowResults()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleGoToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const handleShowResults = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    const correctAnswers = questionStates.map((state, index) => 
      state.isCorrect ? index : -1
    ).filter(index => index !== -1)
    
    const results: QuizResults = {
      score: Math.round((correctAnswers.length / quiz.content.questions.length) * 100),
      totalQuestions: quiz.content.questions.length,
      correctAnswers,
      userAnswers: questionStates.map(state => state.selectedAnswer),
      timeSpent
    }

    setShowResults(true)
    onComplete?.(results)
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setQuestionStates(quiz.content.questions.map(() => ({
      selectedAnswer: null,
      isAnswered: false,
      isCorrect: false,
      showFeedback: false
    })))
    setShowResults(false)
  }

  if (showResults) {
    const correctCount = questionStates.filter(state => state.isCorrect).length
    const score = Math.round((correctCount / quiz.content.questions.length) * 100)
    
    return (
      <div className={cn(
        "flex flex-col bg-white",
        isFullscreen ? "fixed inset-0 z-50 h-screen" : "h-full"
      )}>
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Quiz Results</h2>
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
          {/* Score Summary */}
          <div className="text-center mb-8">
            <div className={cn(
              "w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold",
              score >= 80 ? "bg-green-100 text-green-700" :
              score >= 60 ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            )}>
              {score}%
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {score >= 80 ? "Great job!" : score >= 60 ? "Good effort!" : "Keep practicing!"}
            </h3>
            <p className="text-gray-600">
              You got {correctCount} out of {quiz.content.questions.length} questions correct
            </p>
          </div>

          {/* AI Insights */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">AI Study Insights</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  {score < 60 && (
                    <p>• Focus on reviewing memory and learning concepts - you missed several questions in this area</p>
                  )}
                  {score >= 60 && score < 80 && (
                    <p>• You have a solid foundation! Review classical conditioning and research methods for improvement</p>
                  )}
                  {score >= 80 && (
                    <p>• Excellent understanding! Consider exploring more advanced topics in neuroplasticity</p>
                  )}
                  <p>• Recommended next study session: 15-minute review of missed concepts</p>
                  <p>• Practice retrieval: Try explaining these concepts in your own words</p>
                </div>
              </div>
            </div>
          </div>

          {/* Question Review */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Question Review</h4>
            {quiz.content.questions.map((question, index) => {
              const state = questionStates[index]
              const isCorrect = state.isCorrect
              
              return (
                <div key={question.id} className={cn(
                  "border rounded-lg p-4",
                  isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-1 rounded-full",
                      isCorrect ? "bg-green-600" : "bg-red-600"
                    )}>
                      {isCorrect ? 
                        <Check className="w-4 h-4 text-white" /> : 
                        <X className="w-4 h-4 text-white" />
                      }
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-2">
                        {index + 1}. {question.question}
                      </p>
                      <p className={cn(
                        "text-sm mb-1",
                        isCorrect ? "text-green-700" : "text-red-700"
                      )}>
                        Your answer: {question.options[state.selectedAnswer!]}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-700 mb-1">
                          Correct answer: {question.options[question.correctAnswer]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={handleRestart}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-asu-maroon text-white rounded-lg hover:bg-red-900 transition-colors"
          >
            Close Quiz
          </button>
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
            <h2 className="text-lg font-semibold text-gray-900">{quiz.title}</h2>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {quiz.content.questions.length}
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
            style={{ width: `${((currentQuestionIndex + (currentState.isAnswered ? 1 : 0)) / quiz.content.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Navigation Dots */}
      <div className="px-6 py-3 border-b border-gray-100">
        <div className="flex items-center justify-center gap-2">
          {quiz.content.questions.map((_, index) => {
            const state = questionStates[index]
            const isCurrent = index === currentQuestionIndex
            
            return (
              <button
                key={index}
                onClick={() => handleGoToQuestion(index)}
                className={cn(
                  "w-8 h-8 rounded-full text-xs font-medium transition-all",
                  isCurrent
                    ? "bg-asu-maroon text-white"
                    : state.isAnswered
                      ? state.isCorrect
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Question */}
          <h3 className="text-xl font-semibold text-gray-900 mb-8">
            {currentQuestion.question}
          </h3>

          {/* Answer Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => {
              const isSelected = currentState.selectedAnswer === index
              const isCorrect = index === currentQuestion.correctAnswer
              const showCorrectAnswer = currentState.showFeedback && isCorrect
              const showIncorrectAnswer = currentState.showFeedback && isSelected && !isCorrect
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={currentState.isAnswered}
                  className={cn(
                    "w-full p-4 text-left border rounded-lg transition-all",
                    !currentState.isAnswered && "hover:border-gray-400 hover:bg-gray-50",
                    isSelected && !currentState.showFeedback && "border-asu-maroon bg-red-50",
                    showCorrectAnswer && "border-green-500 bg-green-50 text-green-800",
                    showIncorrectAnswer && "border-red-500 bg-red-50 text-red-800",
                    !isSelected && !showCorrectAnswer && currentState.showFeedback && "opacity-50",
                    currentState.isAnswered ? "cursor-default" : "cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium",
                      showCorrectAnswer && "border-green-500 bg-green-500 text-white",
                      showIncorrectAnswer && "border-red-500 bg-red-500 text-white",
                      isSelected && !currentState.showFeedback && "border-asu-maroon bg-asu-maroon text-white",
                      !isSelected && !currentState.showFeedback && "border-gray-300 text-gray-600"
                    )}>
                      {showCorrectAnswer && <Check className="w-4 h-4" />}
                      {showIncorrectAnswer && <X className="w-4 h-4" />}
                      {!currentState.showFeedback && String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Feedback */}
          {currentState.showFeedback && currentQuestion.explanation && (
            <div className={cn(
              "p-4 rounded-lg mb-8",
              currentState.isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-1 rounded-full",
                  currentState.isCorrect ? "bg-green-600" : "bg-red-600"
                )}>
                  {currentState.isCorrect ? 
                    <Check className="w-4 h-4 text-white" /> : 
                    <X className="w-4 h-4 text-white" />
                  }
                </div>
                <div>
                  <p className={cn(
                    "font-semibold mb-2",
                    currentState.isCorrect ? "text-green-800" : "text-red-800"
                  )}>
                    {currentState.isCorrect ? "Correct!" : "Incorrect"}
                  </p>
                  <p className={cn(
                    "text-sm",
                    currentState.isCorrect ? "text-green-700" : "text-red-700"
                  )}>
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={cn(
              "flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
              currentQuestionIndex === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Answer Status / Navigation Button */}
          {!currentState.isAnswered ? (
            <div className="flex-1 px-4 py-3 text-center text-sm text-gray-500 bg-gray-50 rounded-lg">
              Select an answer to continue
            </div>
          ) : allQuestionsAnswered && !isLastQuestion ? (
            <button
              onClick={handleShowResults}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              Submit Quiz
              <Check className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-3 bg-asu-maroon text-white rounded-lg hover:bg-red-900 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              {isLastQuestion ? "View Results" : "Next Question"}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}