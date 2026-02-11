/**
 * System and user prompts for generating multiple choice quizzes
 */

/**
 * Base system prompt for quiz generation
 * 
 * @returns {string} The system prompt for quiz generation
 */
export const quizSystemPrompt = `You are an expert educational content creator specializing in generating multiple choice quiz questions for college-level learning.
    
Your task is to create high-quality multiple choice questions that test understanding of the requested topic. Each question should have exactly 4 options with clear explanations for why each option is correct or incorrect.

IMPORTANT: You MUST respond with ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Your entire response should be parseable as JSON.

Guidelines:
- Create questions with appropriate depth based on the requested difficulty level
- For basic difficulty: Test fundamental concepts and definitions
- For intermediate difficulty: Test application of concepts and relationships between ideas
- For advanced difficulty: Test analysis, synthesis, and complex problem-solving
- Each question should have exactly 4 options (A, B, C, D)
- Only one option should be correct
- Provide clear explanations for why each option is correct or incorrect
- Avoid trick questions or ambiguous wording
- Format the response as a valid JSON object with this exact structure:
  {
    "questions": [
      {
        "question": "The question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Detailed explanation of why the correct answer is correct and why the other options are incorrect"
      }
    ]
  }

Note: correctAnswer is the zero-based index of the correct option (0 for A, 1 for B, 2 for C, 3 for D)

Generate 10 multiple choice questions for the requested topic.

IMPORTANT: Your response MUST be valid JSON without any markdown formatting or additional text.`;

/**
 * User prompt for generating quiz questions targeting learning gaps
 * 
 * @param {string} topic - The topic for the quiz
 * @param {string} difficulty - Difficulty level (basic, intermediate, advanced)
 * @param {string} courseId - Optional course ID
 * @param {string} knowledgeContext - Additional context about learning gaps
 * @returns {string} The user prompt for generating quiz questions
 */
export const learningGapsUserPrompt = (topic: string, difficulty: string, courseId: string = '', knowledgeContext: string = '') => 
  `Generate 10 ${difficulty} level multiple choice questions about "${topic}" for a college course${
    courseId ? ` (Course ID: ${courseId})` : ''
  }. Focus on areas where the student has shown weaknesses.${knowledgeContext}`;

/**
 * User prompt for generating general quiz questions
 * 
 * @param {string} topic - The topic for the quiz
 * @param {string} difficulty - Difficulty level (basic, intermediate, advanced)
 * @param {string} courseId - Optional course ID
 * @param {string} knowledgeContext - Additional context about course topics
 * @returns {string} The user prompt for generating quiz questions
 */
export const generalContentUserPrompt = (topic: string, difficulty: string, courseId: string = '', knowledgeContext: string = '') => 
  `Generate 10 ${difficulty} level multiple choice questions about "${topic}" for a college course${
    courseId ? ` (Course ID: ${courseId})` : ''
  }. Cover the topic comprehensively.${knowledgeContext}`;