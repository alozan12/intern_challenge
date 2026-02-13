import { NextRequest, NextResponse } from 'next/server';
import { generateInsight, queryCreateAI } from '@/lib/createAI';
import { createAIStream } from '@/lib/compatAI';
import { getLearningGaps as getMockLearningGaps } from '@/mocks/learning-gaps';
import { StreamResponse } from '@/lib/utils';
// Import prompt templates
import {
  baseInsightsSystemPrompt,
  performanceInsightsPrompt,
  performanceUserPrompt,
  gapsInsightsPrompt,
  gapsUserPrompt,
  recommendationInsightsPrompt,
  recommendationUserPrompt,
  getRecommendationUserPrompt
} from '@/prompts/insights';
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
  count?: number; // Number of insights to generate
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
    const { studentId, courseId, insightType = 'recommendation', stream = false, count }: InsightsRequest = await req.json();
    
    // Validate and limit count to maximum of 5
    const validatedCount = count ? Math.min(5, Math.max(1, count)) : undefined;
    
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
    
    // Add upcoming deadlines data with course information
    const upcomingDeadlines = courseItemsData.course_items
      .filter(item => item.status === 'upcoming' && item.due_date)
      .map(item => {
        const course = enrolledCourses.find(c => c.course_id === item.course_id)
        return {
          id: item.item_id,
          title: item.title,
          type: item.item_type as 'assignment' | 'quiz' | 'exam' | 'discussion',
          dueDate: new Date(item.due_date || ''),
          courseId: item.course_id,
          courseName: course?.course_name || 'Unknown Course',
          courseCode: course?.course_code || 'N/A'
        }
      });
    
    // Set up system prompt and query based on insight type using imported templates
    let systemPrompt = '';
    let userPrompt = '';
    
    switch (insightType) {
      case 'performance':
        systemPrompt = performanceInsightsPrompt;
        userPrompt = performanceUserPrompt;
        break;
        
      case 'gaps':
        systemPrompt = gapsInsightsPrompt;
        userPrompt = gapsUserPrompt;
        break;
        
      case 'recommendation':
      default:
        systemPrompt = recommendationInsightsPrompt;
        userPrompt = getRecommendationUserPrompt(validatedCount);
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