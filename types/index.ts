export interface Course {
  id: string
  name: string
  code: string
  color: string
  upcomingDeadlines: Deadline[]
  progress: number
}

export interface Deadline {
  id: string
  title: string
  type: 'assignment' | 'quiz' | 'exam' | 'discussion'
  dueDate: Date
  courseId: string
}

export interface StudySession {
  id: string
  courseId: string
  date: Date
  duration: number
  topics: string[]
}

export interface Analytics {
  overallProgress: number
  confidence: number
  studyStreak: number
  hoursStudied: number
}

// Preparation page types
export interface SessionHistory {
  id: string
  courseId: string
  courseName: string
  title: string
  date: Date
  type: 'study' | 'practice' | 'review'
  duration: number
  materials: StudyMaterial[]
}

export interface KnowledgeBaseItem {
  id: string
  courseId: string
  title: string
  type: 'lecture' | 'assignment' | 'quiz' | 'reading' | 'module'
  content: string
  lastAccessed?: Date
  isSelected: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface StudyMaterial {
  id: string
  type: 'flashcards' | 'quiz' | 'summary' | 'outline' | 'practice_problems'
  title: string
  content: any // This will vary based on type
  createdAt: Date
}

export interface FlashcardSet extends StudyMaterial {
  type: 'flashcards'
  content: {
    cards: Array<{
      id: string
      front: string
      back: string
    }>
  }
}

export interface QuizSet extends StudyMaterial {
  type: 'quiz'
  content: {
    questions: Array<{
      id: string
      question: string
      options: string[]
      correctAnswer: number
      explanation?: string
    }>
  }
}

export interface Summary extends StudyMaterial {
  type: 'summary'
  content: {
    text: string
    keyPoints: string[]
  }
}