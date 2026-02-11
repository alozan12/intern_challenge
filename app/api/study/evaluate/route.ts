import { NextRequest, NextResponse } from 'next/server';
import { queryCreateAI } from '@/lib/createAI';

// Define interfaces for evaluation request and response
interface EvaluateRequest {
  userAnswer: string;
  correctAnswer: string;
  term: string;
}

interface EvaluateResponse {
  cardId?: string;
  userAnswer: string;
  isCorrect: boolean;
  aiScore: number;
  aiExplanation: string;
}

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { userAnswer, correctAnswer, term }: EvaluateRequest = await req.json();
    
    if (!userAnswer || !correctAnswer || !term) {
      return NextResponse.json(
        { error: 'Required parameters missing' },
        { status: 400 }
      );
    }

    // Set up system prompt and user prompt
    const systemPrompt = `You are an expert educational evaluator helping students learn through flashcards. Your task is to provide accurate, constructive, and supportive feedback on student answers.

Guidelines:
- Evaluate how well the student's answer matches the correct definition
- Use both semantic understanding and key concept matching
- Provide a score from 0-100
- Determine if the answer is correct (isCorrect: true for scores 60 or higher)
- Write a concise, specific, and educational explanation (1-2 sentences)
- Highlight specific strengths and areas for improvement
- Maintain a positive, encouraging tone focused on learning
- Format response as JSON with aiScore, isCorrect, and aiExplanation fields

Your goal is to help students improve their understanding, not just grade them.`;

    const userPrompt = `Evaluate this student's flashcard response:
Term: "${term}"
Correct definition: "${correctAnswer}"
Student's answer: "${userAnswer}"

Provide a score, correctness assessment, and helpful explanation.`;
    
    // Set up options for CreateAI API
    const options = {
      modelProvider: 'gcp-deepmind', // Use Google's Gemini models
      modelName: 'geminiflash3', // Gemini Flash 3 model
      systemPrompt,
      sessionId: `evaluate_${Date.now()}`,
      temperature: 0.3, // Lower temperature for consistent evaluations
      context: {
        term,
        correctAnswer,
        userAnswer
      }
    };
    
    // Call the CreateAI API
    const response = await queryCreateAI<{ response: string }>(userPrompt, options);
    
    if (response.error) {
      console.error('Error evaluating answer:', response.error);
      
      // Fall back to simple evaluation if API call fails
      return NextResponse.json(fallbackEvaluation(userAnswer, correctAnswer, term));
    }
    
    try {
      // Parse the AI response - handle markdown code blocks if present
      let responseText = response.data?.response || '{}';
      let evaluationData;
      
      try {
        // First try direct parse
        evaluationData = JSON.parse(responseText);
      } catch (initialParseError) {
        // Extract JSON if wrapped in markdown code blocks
        if (responseText.includes('```json')) {
          const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            responseText = jsonMatch[1];
            evaluationData = JSON.parse(responseText);
          } else {
            throw new Error('Could not extract JSON from markdown');
          }
        } else if (responseText.includes('{') && responseText.includes('}')) {
          // Try to extract JSON from anywhere in the text
          const possibleJson = responseText.substring(
            responseText.indexOf('{'),
            responseText.lastIndexOf('}') + 1
          );
          
          evaluationData = JSON.parse(possibleJson);
        } else {
          throw new Error('No JSON found in response');
        }
      }
      
      // Format the response
      const evaluation: EvaluateResponse = {
        userAnswer,
        isCorrect: evaluationData.isCorrect === true,
        aiScore: typeof evaluationData.aiScore === 'number' ? evaluationData.aiScore : 0,
        aiExplanation: evaluationData.aiExplanation || 'No explanation provided.'
      };
      
      return NextResponse.json(evaluation);
    } catch (parseError) {
      console.error('Error parsing AI evaluation:', parseError);
      
      // Fall back to simple evaluation if parsing fails
      return NextResponse.json(fallbackEvaluation(userAnswer, correctAnswer, term));
    }
  } catch (error) {
    console.error('Error in evaluate API:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate answer' },
      { status: 500 }
    );
  }
}

// Simple fallback evaluation function if AI call fails
function fallbackEvaluation(userAnswer: string, correctAnswer: string, term: string): EvaluateResponse {
  const userLower = userAnswer.toLowerCase().trim();
  const correctLower = correctAnswer.toLowerCase();
  
  // Simple keyword matching for basic evaluation
  const keyWords = correctLower.match(/\\b\\w+\\b/g)?.filter(word => word.length > 3) || [];
  const matchedWords = keyWords.filter(word => userLower.includes(word));
  const score = Math.min(100, Math.round((matchedWords.length / Math.max(keyWords.length, 1)) * 100));
  
  let feedback = '';
  let isCorrect = false;
  
  if (score >= 80) {
    isCorrect = true;
    feedback = `Excellent! Your definition captures the key concepts well. You mentioned the important aspects of ${term}.`;
  } else if (score >= 60) {
    isCorrect = true;
    feedback = `Good understanding! You got the main idea. Consider including more details about ${keyWords.slice(0, 2).join(' and ')}.`;
  } else if (score >= 40) {
    feedback = `Partially correct. You're on the right track, but missing key concepts. Focus on ${keyWords.slice(0, 3).join(', ')}.`;
  } else if (userAnswer.trim().length > 0) {
    feedback = `This doesn't quite match the definition. Review the key concepts: ${keyWords.slice(0, 3).join(', ')}. Try focusing on what ${term} actually does or means.`;
  } else {
    feedback = `Please provide an answer to receive feedback.`;
  }
  
  return {
    userAnswer,
    isCorrect,
    aiScore: score,
    aiExplanation: feedback
  };
}