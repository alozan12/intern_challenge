import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// For debugging
console.log('Database environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '******' : 'not set');

// Mock data for development - used when database connection fails
const mockCourseMaterials = {
  '1': [
    {
      material_id: 'm101',
      course_id: '1',
      material_type: 'lecture',
      week: 1,
      title: 'Introduction to Course',
      filename: 'intro_lecture.pptx',
      canvas_url: 'https://canvas.asu.edu/courses/1/files/intro_lecture.pptx',
      file_url: '/files/intro_lecture.pptx',
      text_instruction: 'Welcome to the course! This lecture covers course expectations and syllabus.'
    },
    {
      material_id: 'm102',
      course_id: '1',
      material_type: 'reading',
      week: 1,
      title: 'Syllabus',
      filename: 'syllabus.pdf',
      canvas_url: 'https://canvas.asu.edu/courses/1/files/syllabus.pdf',
      file_url: '/files/syllabus.pdf',
      text_instruction: 'Please read the syllabus carefully and complete the syllabus quiz by Friday.'
    },
    {
      material_id: 'm103',
      course_id: '1',
      material_type: 'assignment',
      week: 1,
      title: 'Introduction Discussion',
      filename: '',
      canvas_url: 'https://canvas.asu.edu/courses/1/discussions/intro',
      file_url: '',
      text_instruction: 'Post a brief introduction about yourself and respond to at least two classmates.'
    },
    {
      material_id: 'm104',
      course_id: '1',
      material_type: 'quiz',
      week: 1,
      title: 'Syllabus Quiz',
      filename: '',
      canvas_url: 'https://canvas.asu.edu/courses/1/quizzes/syllabus',
      file_url: '',
      text_instruction: 'Complete this quiz to demonstrate your understanding of course policies.'
    }
  ],
  '2': [
    {
      material_id: 'm201',
      course_id: '2',
      material_type: 'lecture',
      week: 1,
      title: 'Basic Concepts',
      filename: 'lecture1.pptx',
      canvas_url: 'https://canvas.asu.edu/courses/2/files/lecture1.pptx',
      file_url: '/files/lecture1.pptx',
      text_instruction: 'This lecture introduces fundamental concepts of the course.'
    },
    {
      material_id: 'm202',
      course_id: '2',
      material_type: 'reading',
      week: 1,
      title: 'Chapter 1: Foundations',
      filename: 'chapter1.pdf',
      canvas_url: 'https://canvas.asu.edu/courses/2/files/chapter1.pdf',
      file_url: '/files/chapter1.pdf',
      text_instruction: 'Read Chapter 1 and complete the reading quiz by Wednesday.'
    },
    {
      material_id: 'm203',
      course_id: '2',
      material_type: 'module',
      week: 2,
      title: 'Advanced Topics',
      filename: '',
      canvas_url: 'https://canvas.asu.edu/courses/2/modules/advanced',
      file_url: '',
      text_instruction: 'This module covers more advanced concepts building on the basics.'
    }
  ],
  '3': [
    {
      material_id: 'm301',
      course_id: '3',
      material_type: 'lecture',
      week: 1,
      title: 'Course Overview',
      filename: 'overview.pdf',
      canvas_url: 'https://canvas.asu.edu/courses/3/files/overview.pdf',
      file_url: '/files/overview.pdf',
      text_instruction: 'An overview of course topics and learning objectives.'
    },
    {
      material_id: 'm302',
      course_id: '3',
      material_type: 'assignment',
      week: 1,
      title: 'Initial Assessment',
      filename: '',
      canvas_url: 'https://canvas.asu.edu/courses/3/assignments/initial',
      file_url: '',
      text_instruction: 'Complete this initial assessment to help me gauge your current knowledge.'
    },
    {
      material_id: 'm303',
      course_id: '3',
      material_type: 'module',
      week: 1,
      title: 'Getting Started',
      filename: '',
      canvas_url: 'https://canvas.asu.edu/courses/3/modules/start',
      file_url: '',
      text_instruction: 'Complete all items in this module before proceeding to the next section.'
    }
  ],
};

// Test database connection explicitly
async function testDatabaseConnection() {
  try {
    const { query } = await import('@/lib/db');
    const result = await query('SELECT NOW() as current_time');
    console.log('Database connection test successful:', result.rows[0].current_time);
    return { success: true, message: 'Database connection successful' };
  } catch (error: any) {
    console.error('Database connection test failed:', error.message);
    return { 
      success: false, 
      message: 'Database connection failed',
      error: error.message
    };
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  // Await params to get the actual courseId
  const { courseId } = await params;
  
  console.log(`API route called with courseId: ${courseId}`);
  
  // Test database connection
  const dbTest = await testDatabaseConnection();

  // Make sure courseId is defined and not empty (could be empty string)
  if (!courseId || courseId.trim() === '') {
    console.log('Missing courseId in request params');
    return NextResponse.json(
      { 
        success: false, 
        error: 'Course ID is required' 
      }, 
      { status: 400 }
    );
  }
  
  console.log(`Processing request for courseId: "${courseId}"`);
  
  // If database connection failed, use mock data immediately
  if (!dbTest.success) {
    console.log('Database connection failed, using mock data');
    const mockMaterials = mockCourseMaterials[courseId] || [];
    return NextResponse.json({
      success: true,
      materials: mockMaterials,
      isMockData: true,
      dbStatus: dbTest.message
    });
  }

  try {
    console.log('Attempting database query for course materials...');
    // Query to get all materials for the specified course
    const materialsResult = await query(`
      SELECT material_id, course_id, material_type, week, title, 
             filename, canvas_url, file_url, text_instruction
      FROM course_materials
      WHERE course_id = $1
      ORDER BY week ASC, title ASC;
    `, [courseId]);

    const materials = materialsResult.rows;
    console.log(`Query successful, found ${materials.length} materials`);
    
    return NextResponse.json({ 
      success: true, 
      materials: materials 
    });
  } catch (error: any) {
    console.error('Error fetching course materials:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code // PostgreSQL error code
    });
    
    // Use mock data in development if database query fails
    if (process.env.NODE_ENV === 'development') {
      console.log(`Using mock data for courseId: ${courseId}`);
      
      // Return mock data for the requested course ID, or empty array if not found
      const mockMaterials = mockCourseMaterials[courseId] || [];
      console.log(`Returning ${mockMaterials.length} mock materials`);
      
      return NextResponse.json({
        success: true,
        materials: mockMaterials,
        isMockData: true
      });
    }
    
    // Return error response in production
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch course materials',
        errorDetails: process.env.NODE_ENV === 'development' ? {
          name: error.name,
          code: error.code,
          stack: error.stack?.split('\n').slice(0, 3).join('\n')
        } : undefined
      }, 
      { status: 500 }
    );
  }
}