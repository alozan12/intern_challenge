/**
 * Central export file for all prompts in the application
 */

// Chat prompts
export * from './chat/study-coach';
export * from './chat/study-mode';

// Insights prompts
export * from './insights';

// Study content prompts - use namespaced exports to avoid naming conflicts
export * as flashcards from './study/flashcards';
export * as quiz from './study/quiz';