import { NextRequest, NextResponse } from 'next/server';
import { queryCreateAI, generateInsight } from '@/lib/createAI';
import { createAIStream } from '@/lib/compatAI';
import { getLearningGaps } from '@/mocks/learning-gaps';
import { StreamResponse } from '@/lib/utils';
// TextEncoder for the Edge runtime
const encoder = new TextEncoder();

// Import mock data
import courseItemsData from '@/mocks/course-items.json';
import studentProfileData from '@/mocks/student-profile.json';

// Define interfaces
interface RecommendationsRequest {
  studentId: string;
  courseId?: string;
  count?: number;
  stream?: boolean;
}

interface Recommendation {
  title: string;
  description: string;
  type: 'quick' | 'focused';
  duration: 10 | 30;
  topics: string[];
  priority: 'high' | 'medium' | 'low';
  course_id?: string;
  course_code?: string;
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  timestamp: string;
}

// Create the recommendations endpoint
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { studentId, courseId, count = 3, stream = false }: RecommendationsRequest = await req.json();
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }
    
    // Get learning gaps and course information
    const learningGapsData = getLearningGaps(studentId, courseId);
    
    // Filter course items for this student/course
    const studentItems = courseId
      ? courseItemsData.course_items.filter(item => 
          item.student_id === studentId && item.course_id === courseId
        )
      : courseItemsData.course_items.filter(item => 
          item.student_id === studentId
        );
    
    // Get student profile information
    const studentProfile = studentProfileData.student;
    const enrolledCourses = studentProfileData.courses;
    
    // Get upcoming deadlines
    const upcomingDeadlines = studentItems
      .filter(item => item.due_date && new Date(item.due_date) > new Date())
      .map(item => ({
        id: item.item_id,
        course_id: item.course_id,
        course_code: enrolledCourses.find(c => c.course_id === item.course_id)?.course_code,
        title: item.title,
        type: item.item_type,
        due_date: item.due_date as string,
        points_possible: item.points_possible
      }))
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    // Create system prompt for AI
    const systemPrompt = 
      'You are the ASU Study Coach recommendations engine, an AI assistant that generates personalized study recommendations for students.' +
      '\n\nYour task is to generate personalized study recommendations based on the student\'s performance, learning gaps, and upcoming deadlines.' +
      '\n\nYou have access to:' +
      '\n- Student profile and preferences' +
      '\n- Course performance data' +
      '\n- Identified learning gaps' +
      '\n- Upcoming deadlines' +
      '\n\nFormat your response as a JSON object with a "recommendations" array containing recommendation objects with these fields:' +
      '\n- title: Brief, engaging title for the recommendation (e.g., "Master Tree Traversals")' +
      '\n- description: 1-2 sentence description of the recommendation' +
      '\n- type: Either "quick" (for short activities) or "focused" (for longer sessions)' +
      '\n- duration: Either 10 or 30 (minutes)' +
      '\n- topics: Array of relevant topics covered by this recommendation' +
      '\n- priority: "high", "medium", or "low" based on urgency and importance' +
      '\n- course_id: Optional course ID if the recommendation is course-specific' +
      '\n- course_code: Optional course code if the recommendation is course-specific';
    
    // Create user prompt
    const userPrompt = `Generate ${count} personalized study recommendations for ${studentProfile.name} (ID: ${studentId})${
      courseId ? ` in course ${enrolledCourses.find(c => c.course_id === courseId)?.course_name || courseId}` : ''
    }. Focus on their learning gaps and upcoming deadlines.`;

    // Prepare context for AI
    const aiContext = {
      studentId,
      studentName: studentProfile.name,
      courseId,
      courseName: courseId 
        ? enrolledCourses.find(c => c.course_id === courseId)?.course_name 
        : undefined,
      coursePerformance: studentItems,
      learningGaps: learningGapsData,
      upcomingDeadlines,
      performanceMetrics: studentProfileData.performance_metrics,
      learningPreferences: studentProfileData.learning_preferences,
      enrolledCourses
    };

    // Set up options for CreateAI API
    const options = {
      modelProvider: 'aws',
      modelName: 'claude4_5_sonnet',
      sessionId: `recommendations_${studentId}_${Date.now()}`,
      systemPrompt,
      temperature: 0.7, // Slightly higher temperature for more creative recommendations
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
    const response = await queryCreateAI<{ recommendations: Recommendation[] }>(userPrompt, options);

    // If direct API fails, use project API as fallback
    if (response.error) {
      console.warn('Direct API call failed, falling back to project API:', response.error);
      
      // Skip project API - we don't have access
      console.log('Falling back to mock data');
      
      // Return mock data
      const responseData: RecommendationsResponse = {
        recommendations: getMockRecommendations(courseId),
        timestamp: new Date().toISOString()
      };
      
      return NextResponse.json(responseData);
    }

    // Format successful response
    const responseData: RecommendationsResponse = {
      recommendations: response.data?.recommendations || getMockRecommendations(courseId),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in recommendations API:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

/**
 * Provides mock recommendations when API fails
 */
function getMockRecommendations(courseId?: string): Recommendation[] {
  const baseRecommendations: Recommendation[] = [
    {
      title: 'Master Tree Balancing',
      description: 'Focus on understanding AVL and red-black tree algorithms through visual examples and practice problems',
      type: 'focused',
      duration: 30,
      topics: ['tree balancing', 'AVL trees', 'red-black trees'],
      priority: 'high',
      course_id: '112233',
      course_code: 'CSE310'
    },
    {
      title: 'Quick BST Complexity Review',
      description: 'Refresh your understanding of time complexity differences between balanced and unbalanced binary search trees',
      type: 'quick',
      duration: 10,
      topics: ['BST complexity', 'time complexity analysis'],
      priority: 'high',
      course_id: '112233',
      course_code: 'CSE310'
    },
    {
      title: 'Prepare for Graph Algorithms',
      description: 'Preview fundamental graph traversal algorithms before your upcoming quiz on Graphs',
      type: 'focused',
      duration: 30,
      topics: ['graph traversal', 'BFS', 'DFS'],
      priority: 'medium',
      course_id: '112233',
      course_code: 'CSE310'
    },
    {
      title: 'Review Programming Paradigms',
      description: 'Strengthen your understanding of procedural programming concepts',
      type: 'quick',
      duration: 10,
      topics: ['procedural programming', 'programming paradigms'],
      priority: 'medium',
      course_id: '112234',
      course_code: 'CSE340'
    }
  ];
  
  // If courseId is provided, filter to that course
  if (courseId) {
    return baseRecommendations
      .filter(rec => rec.course_id === courseId)
      .slice(0, 3);
  }
  
  // Otherwise, return a mix of recommendations
  return baseRecommendations.slice(0, 3);
}