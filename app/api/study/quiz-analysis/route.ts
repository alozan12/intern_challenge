'use server';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { score, totalQuestions, correctQuestions, incorrectQuestions, timeSpent, quizTitle } = data;
    
    // In a real application, this would call an AI service
    // Here we'll simulate an AI response based on the provided data
    
    // Generate strengths based on correct answers
    const strengths = correctQuestions.length > 0 
      ? correctQuestions.slice(0, 3).map((q: any) => q.question.split('?')[0].trim())
      : ['No specific strengths identified'];
    
    // Generate weaknesses based on incorrect answers
    const weaknesses = incorrectQuestions.length > 0
      ? incorrectQuestions.slice(0, 3).map((q: any) => q.question.split('?')[0].trim())
      : ['No specific weaknesses identified'];
    
    // Generate recommendations based on score and time spent
    const recommendations = [];
    
    // Score-based recommendations
    if (score < 50) {
      recommendations.push('Schedule a 30-minute review session focusing on fundamental concepts');
      recommendations.push('Consider seeking help from your instructor during office hours');
    } else if (score < 75) {
      recommendations.push('Create flashcards for the topics you struggled with');
      recommendations.push('Schedule a 20-minute targeted review of the missed concepts');
    } else {
      recommendations.push('Explore related advanced topics to deepen your understanding');
      recommendations.push('Share your knowledge by explaining these concepts to peers');
    }
    
    // Time-based recommendations
    const averageTimePerQuestion = timeSpent / totalQuestions;
    if (averageTimePerQuestion > 30 && score < 80) {
      recommendations.push('Practice with timed quizzes to improve your speed');
    } else if (averageTimePerQuestion < 10 && score < 70) {
      recommendations.push('Take more time to carefully read questions before answering');
    }
    
    // Add spaced repetition recommendation
    recommendations.push('Review these concepts again in 3 days to reinforce your memory');
    
    // Return the analysis
    return NextResponse.json({
      analysis: {
        strengths,
        weaknesses,
        recommendations
      },
      success: true
    });
    
  } catch (error) {
    console.error('Error analyzing quiz performance:', error);
    return NextResponse.json(
      { error: 'Failed to analyze quiz performance', success: false },
      { status: 500 }
    );
  }
}