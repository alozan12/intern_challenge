import { NextRequest, NextResponse } from 'next/server';
import { queryCreateAI } from '@/lib/createAI';
import { detectLearningGaps } from '@/lib/learning-gaps';
import { QuizSet } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';
// Import quiz prompts
import { quiz } from '@/prompts';

// Define interfaces for quiz generation request
interface QuizRequest {
  topic: string;
  courseId?: string;
  difficulty?: 'basic' | 'intermediate' | 'advanced';
  generationType?: 'learning_gaps' | 'general_content';
  studentId?: string;
}

// Load knowledge base data
async function loadKnowledgeBase(courseId?: string, studentId?: string) {
  try {
    const filePath = path.join(process.cwd(), 'mocks', 'course-items.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Filter by courseId and studentId if provided
    let courseItems = data.course_items || [];
    if (courseId) {
      courseItems = courseItems.filter((item: any) => item.course_id === courseId);
    }
    if (studentId) {
      courseItems = courseItems.filter((item: any) => item.student_id === studentId);
    }
    
    return courseItems;
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { 
      topic, 
      courseId, 
      difficulty = 'intermediate', 
      generationType = 'general_content',
      studentId = '987654' 
    }: QuizRequest = await req.json();
    
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }
    
    // Load knowledge base data
    const courseItems = await loadKnowledgeBase(courseId, studentId);
    console.log('Loaded course items:', courseItems.length);
    
    // Extract learning gaps if needed
    let knowledgeContext = '';
    let focusAreas: string[] = [];
    
    if (generationType === 'learning_gaps' && courseId) {
      const gaps = detectLearningGaps(studentId, courseId, courseItems);
      console.log('Detected learning gaps:', gaps);
      
      if (gaps.length > 0 && gaps[0].gaps.length > 0) {
        const courseGaps = gaps[0];
        focusAreas = courseGaps.gaps
          .filter(gap => gap.recommended_review)
          .map(gap => gap.topic);
        
        knowledgeContext = `\n\nThe student has shown learning gaps in the following areas:\n${
          courseGaps.gaps.map(gap => 
            `- ${gap.topic} (confidence: ${gap.confidence}, review recommended: ${gap.recommended_review})`
          ).join('\n')
        }\n\nFocus your quiz questions on these specific areas where the student needs improvement.`;
      }
    }
    
    // If no learning gaps found, extract general topics from course items
    if (!knowledgeContext) {
      const topics = new Set<string>();
      courseItems.forEach((item: any) => {
        if (item.attempts && item.attempts.length > 0) {
          item.attempts.forEach((attempt: any) => {
            if (attempt.questions) {
              attempt.questions.forEach((q: any) => {
                topics.add(q.topic);
              });
            }
          });
        }
      });
      
      if (topics.size > 0) {
        knowledgeContext = `\n\nThe course covers the following topics:\n${
          Array.from(topics).map(t => `- ${t}`).join('\n')
        }\n\nCreate quiz questions that comprehensively cover these topics.`;
      }
    }
    
    // Set up system prompt and user prompt using imported templates
    const systemPrompt = quiz.quizSystemPrompt;
    
    const userPrompt = generationType === 'learning_gaps'
      ? quiz.learningGapsUserPrompt(topic, difficulty, courseId, knowledgeContext)
      : quiz.generalContentUserPrompt(topic, difficulty, courseId, knowledgeContext);
    
    // Set up options for CreateAI API
    const options = {
      modelProvider: 'gcp-deepmind',
      modelName: 'geminiflash3',
      sessionId: `quiz_${Date.now()}`,
      systemPrompt,
      temperature: 0.7,
      context: {
        topic,
        courseId,
        difficulty,
        generationType,
        studentId,
        focusAreas,
        knowledgeBase: knowledgeContext,
        timestamp: new Date().toISOString()
      }
    };
    
    // Call the CreateAI API
    console.log('Calling CreateAI for quiz generation');
    const response = await queryCreateAI<{ response: string }>(userPrompt, options);
    
    if (!response.data || response.error) {
      console.error('Error generating quiz:', response.error);
      return NextResponse.json(
        { error: `Failed to generate quiz: ${response.error}` },
        { status: 500 }
      );
    }
    
    try {
      // Parse the AI response
      let responseText = '';
      if (response.data?.response) {
        responseText = response.data.response;
      } else if (response.data) {
        responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      }
      
      console.log('Raw response (first 500 chars):', responseText.substring(0, 500));
      
      // Try to parse as JSON directly first
      let parsedData: any;
      try {
        parsedData = JSON.parse(responseText);
      } catch (e) {
        // If direct parse fails, try to extract from code blocks
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          parsedData = JSON.parse(jsonMatch[1]);
        } else {
          // Try to extract JSON from text
          const jsonStart = responseText.indexOf('{');
          const jsonEnd = responseText.lastIndexOf('}');
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            parsedData = JSON.parse(responseText.substring(jsonStart, jsonEnd + 1));
          } else {
            throw new Error('Could not find valid JSON in response');
          }
        }
      }
      
      // Validate and format the questions
      if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
        throw new Error('Response does not contain a valid questions array');
      }
      
      // Format questions to match QuizSet type
      const formattedQuestions = parsedData.questions.map((q: any, index: number) => ({
        id: `q-${index + 1}`,
        question: q.question || '',
        options: Array.isArray(q.options) ? q.options.slice(0, 4) : ['', '', '', ''],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        explanation: q.explanation || ''
      }));
      
      // Create the quiz set
      const quizSet: QuizSet = {
        id: `quiz-${topic.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        type: 'quiz',
        title: `${topic} Quiz${generationType === 'learning_gaps' ? ' (Targeted Review)' : ''}`,
        createdAt: new Date(),
        content: {
          questions: formattedQuestions
        }
      };
      
      console.log('Generated quiz with', formattedQuestions.length, 'questions');
      
      return NextResponse.json({ quiz: quizSet });
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse quiz data. Please try again.' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in quiz generation API:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}