import { QuizSet } from '@/types';

export interface QuizGenerationRequest {
  topic: string;
  courseId?: string;
  difficulty?: 'basic' | 'intermediate' | 'advanced';
  generationType?: 'learning_gaps' | 'general_content';
  studentId?: string;
}

export interface QuizGenerationResponse {
  quiz: QuizSet;
}

export interface QuizGenerationError {
  error: string;
  debug?: {
    originalResponse?: string;
    parsedData?: string;
    reason?: string;
    knowledgeContext?: string;
  };
}