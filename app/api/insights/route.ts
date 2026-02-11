import { NextRequest, NextResponse } from 'next/server';
import { generateInsight, queryCreateAI } from '@/lib/createAI';
import { createAIStream } from '@/lib/compatAI';
import { getLearningGaps as getMockLearningGaps } from '@/mocks/learning-gaps';
import { StreamResponse } from '@/lib/utils';
// TextEncoder for the Edge runtime
const encoder = new TextEncoder();

// Import mock data
import courseItemsData from '@/mocks/course-items.json';
import studentProfileData from '@/mocks/student-profile.json';

// Define interfaces for insights request and response
interface InsightsRequest {
  studentId: string;
  courseId?: string;
  insightType?: 'performance' | 'recommendation' | 'gaps';
  stream?: boolean;
}

interface InsightsResponse {
  type: string;
  data: any;
  timestamp: string;
}

// Define specific response interfaces
interface Recommendation {
  title: string;
  description: string;
  type: 'quick' | 'focused';
  duration: 10 | 30;
  topics: string[];
  priority: 'high' | 'medium' | 'low';
}

interface RecommendationResponse extends InsightsResponse {
  data: {
    recommendations: Recommendation[];
  }
}

interface PerformanceResponse extends InsightsResponse {
  data: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    advice: string;
  }
}

interface GapsResponse extends InsightsResponse {
  data: {
    gaps: Array<{
      topic: string;
      confidence: string;
      recommended_review: boolean;
    }>;
  }
}

// Create the AI insights generator
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { studentId, courseId, insightType = 'recommendation', stream = false }: InsightsRequest = await req.json();
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }
    
    // Get learning gaps for context
    const learningGapsData = getMockLearningGaps(studentId, courseId);
    
    // Prepare student data context
    const studentData = courseId
      ? courseItemsData.course_items.filter(item => item.course_id === courseId)
      : courseItemsData.course_items;
    
    // Get student profile info
    const studentProfile = studentProfileData.student;
    const enrolledCourses = studentProfileData.courses;
    
    // Add upcoming deadlines data
    const upcomingDeadlines = courseItemsData.course_items
      .filter(item => item.status === 'upcoming' && item.due_date)
      .map(item => ({
        id: item.item_id,
        title: item.title,
        type: item.item_type as 'assignment' | 'quiz' | 'exam' | 'discussion',
        dueDate: new Date(item.due_date),
        courseId: item.course_id
      }));
    
    // Set up system prompt and query based on insight type
    let systemPrompt = 'You are the ASU Study Coach insights generator, an AI assistant that analyzes student performance data to provide personalized insights and recommendations.';
    let userPrompt = '';
    
    switch (insightType) {
      case 'performance':
        systemPrompt += '\n\nYour task is to analyze student performance data and provide concise, actionable insights that help the student improve their learning.';
        systemPrompt += '\n\nYou have access to:';
        systemPrompt += '\n- Student profile information';
        systemPrompt += '\n- Course performance data (quizzes, assignments, etc.)';
        systemPrompt += '\n- Learning gaps identified in their work';
        systemPrompt += '\n- Overall performance metrics';
        systemPrompt += '\n\nFormat your response as a JSON object with the following fields:';
        systemPrompt += '\n- summary: A concise overview of their performance (1-2 sentences)';
        systemPrompt += '\n- strengths: An array of topics or skills they are performing well in';
        systemPrompt += '\n- weaknesses: An array of topics or skills they need to improve on';
        systemPrompt += '\n- advice: Specific, actionable advice for improvement (1-2 sentences)';
        userPrompt = 'Generate performance insights based on this student\'s data.';
        break;
        
      case 'gaps':
        systemPrompt += '\n\nYour task is to identify specific learning gaps based on the student\'s performance data.';
        systemPrompt += '\n\nYou have access to:';
        systemPrompt += '\n- Student\'s performance on quizzes and assignments';
        systemPrompt += '\n- Previously identified learning gaps';
        systemPrompt += '\n- Course materials and topics';
        systemPrompt += '\n\nFormat your response as a JSON object with a "gaps" array containing objects with these fields:';
        systemPrompt += '\n- topic: The specific topic with a knowledge gap';
        systemPrompt += '\n- confidence: The student\'s confidence level ("low", "medium", or "high")';
        systemPrompt += '\n- recommended_review: Boolean indicating if review is recommended';
        userPrompt = 'Identify specific learning gaps for this student based on their performance data.';
        break;
        
      case 'recommendation':
      default:
        systemPrompt += '\n\nYour task is to generate personalized study recommendations based on the student\'s performance, learning gaps, and upcoming deadlines.';
        systemPrompt += '\n\nYou have access to:';
        systemPrompt += '\n- Student profile and preferences';
        systemPrompt += '\n- Course performance data';
        systemPrompt += '\n- Identified learning gaps';
        systemPrompt += '\n\nFormat your response as a JSON object with a "recommendations" array containing 2-3 recommendation objects with these fields:';
        systemPrompt += '\n- title: Brief, engaging title for the recommendation (e.g., "Master Tree Traversals")';
        systemPrompt += '\n- description: 1-2 sentence description of the recommendation';
        systemPrompt += '\n- type: Either "quick" (for short activities) or "focused" (for longer sessions)';
        systemPrompt += '\n- duration: Either 10 or 30 (minutes)';
        systemPrompt += '\n- topics: Array of relevant topics covered by this recommendation';
        systemPrompt += '\n- priority: "high", "medium", or "low" based on urgency and importance';
        userPrompt = 'Generate 2-3 personalized study recommendations for this student based on their data.';
        break;
    }
    
    // Prepare context for AI
    const aiContext = {
      studentId,
      studentName: studentProfile.name,
      courseId,
      courseName: courseId ? enrolledCourses.find(c => c.course_id === courseId)?.course_name : undefined,
      coursePerformance: studentData,
      learningGaps: learningGapsData,
      performanceMetrics: studentProfileData.performance_metrics,
      learningPreferences: studentProfileData.learning_preferences,
      upcomingDeadlines: upcomingDeadlines,
      insightType
    };
    
    // Set up options for CreateAI API
    const options = {
      modelProvider: 'aws',
      modelName: 'claude4_5_sonnet',
      sessionId: `insights_${studentId}_${insightType}_${Date.now()}`,
      systemPrompt,
      temperature: 0.3,
      context: aiContext,
      stream
    };
    
    // For streaming responses
    if (stream) {
      // Use the streaming API
      const streamingResponse = await createAIStream({
        initialMemory: {
          prompt: userPrompt,
          systemPrompt,
          context: aiContext,
          modelProvider: options.modelProvider,
          modelName: options.modelName,
          sessionId: options.sessionId,
          temperature: options.temperature,
          enableSearch: false
        }
      });
      
      return new StreamResponse(streamingResponse as ReadableStream);
    }
    
    // For non-streaming responses
    // Always attempt to use the CreateAI API first
    try {
      console.log('Sending request to CreateAI API...');
      const response = await queryCreateAI(userPrompt, options);
      
      if (!response.error && response.data) {
        console.log('Successfully received CreateAI response');
        
        // Process API response and extract the JSON content
        let responseContent = response.data;
        
        if (typeof response.data === 'object' && 'response' in response.data) {
          // Extract the actual response text
          const rawResponse = response.data.response;
          
          // Try to parse the JSON content from the response
          try {
            if (typeof rawResponse === 'string') {
              // Find JSON content in the string (it might be wrapped in markdown code blocks)
              const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/) || 
                               rawResponse.match(/```([\s\S]*?)```/) ||
                               [null, rawResponse];
                               
              if (jsonMatch && jsonMatch[1]) {
                responseContent = JSON.parse(jsonMatch[1].trim());
              } else {
                // If not in code blocks, try parsing the whole response
                responseContent = JSON.parse(rawResponse.trim());
              }
            }
          } catch (parseError) {
            console.warn('Failed to parse JSON from CreateAI response:', parseError);
            console.log('Raw response:', rawResponse);
            // Continue with the raw response
          }
        }
        
        const responseData: InsightsResponse = {
          type: insightType,
          data: responseContent,
          timestamp: new Date().toISOString()
        };
        
        return NextResponse.json(responseData);
      } else {
        console.warn('CreateAI API error:', response.error);
        throw new Error(response.error || 'Unknown API error');
      }
    } catch (apiError) {
      console.warn('CreateAI API call failed, falling back to mock data:', apiError);
      
      // Return mock data as fallback
      const responseData: InsightsResponse = {
        type: insightType,
        data: getMockInsights(insightType),
        timestamp: new Date().toISOString()
      };
      
      return NextResponse.json(responseData);
    }
    
    // Process API response
    const responseData: InsightsResponse = {
      type: insightType,
      data: response.data || getMockInsights(insightType),
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in insights API:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

/**
 * Provides mock insights for development when API fails
 */
function getMockInsights(insightType: string): any {
  switch (insightType) {
    case 'performance':
      return {
        summary: 'Student has shown improvement in tree data structures, but still has gaps in BST complexity and edge cases. Overall performance is good with 85% average score.',
        strengths: [
          'Linked list operations',
          'Tree traversal algorithms',
          'Object-oriented programming concepts'
        ],
        weaknesses: [
          'BST complexity analysis',
          'Tree balancing algorithms',
          'Edge cases in tree operations',
          'Procedural programming concepts'
        ],
        advice: 'Focus on practicing BST complexity analysis and tree balancing for your upcoming quiz on Graphs, as these fundamentals will be important for graph algorithms.'
      };
      
    case 'gaps':
      return {
        gaps: [
          {
            topic: 'BST complexity',
            confidence: 'medium',
            recommended_review: true
          },
          {
            topic: 'tree balancing',
            confidence: 'low',
            recommended_review: true
          },
          {
            topic: 'edge cases in tree operations',
            confidence: 'medium',
            recommended_review: true
          },
          {
            topic: 'procedural programming concepts',
            confidence: 'low',
            recommended_review: true
          },
          {
            topic: 'array insertion complexity',
            confidence: 'medium',
            recommended_review: true
          }
        ]
      };
      
    case 'recommendation':
    default:
      return {
        recommendations: [
          {
            title: 'Master Tree Balancing',
            description: 'Focus on understanding AVL and red-black tree algorithms through visual examples and practice problems',
            type: 'focused',
            duration: 30,
            topics: ['tree balancing', 'AVL trees', 'red-black trees'],
            priority: 'high'
          },
          {
            title: 'Quick BST Complexity Review',
            description: 'Refresh your understanding of time complexity differences between balanced and unbalanced binary search trees',
            type: 'quick',
            duration: 10,
            topics: ['BST complexity', 'time complexity analysis'],
            priority: 'high'
          },
          {
            title: 'Prepare for Graph Algorithms',
            description: 'Preview fundamental graph traversal algorithms before your upcoming quiz on Graphs',
            type: 'focused',
            duration: 30,
            topics: ['graph traversal', 'BFS', 'DFS'],
            priority: 'medium'
          }
        ]
      };
  }
}