import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// For now, we'll hardcode the student ID
// In a real app, this would come from authentication
const CURRENT_STUDENT_ID = '987655';

// Mock courses for development
const mockCourses = [
  { course_id: '1001', course_code: 'CSE 110', course_name: 'Introduction to Computer Science', term: 'Spring 2024' },
  { course_id: '1002', course_code: 'MAT 265', course_name: 'Calculus I', term: 'Spring 2024' },
  { course_id: '1003', course_code: 'ENG 101', course_name: 'English Composition', term: 'Spring 2024' },
  { course_id: '1004', course_code: 'CHM 113', course_name: 'General Chemistry', term: 'Spring 2024' },
  { course_id: '1005', course_code: 'PSY 101', course_name: 'Introduction to Psychology', term: 'Spring 2024' }
];

export async function GET() {
  try {
    // Query to get all courses the student is enrolled in
    const coursesResult = await query(`
      SELECT c.course_id, c.course_code, c.course_name, c.term
      FROM courses c
      JOIN enrollments e ON c.course_id = e.course_id
      WHERE e.student_id = $1
      ORDER BY c.course_name;
    `, [CURRENT_STUDENT_ID]);

    // Get all courses
    const courses = coursesResult.rows;
    
    return NextResponse.json({ 
      success: true, 
      courses: courses
    });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    
    // Use mock data in development if database fails
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock courses data');
      return NextResponse.json({ 
        success: true, 
        courses: mockCourses,
        isMockData: true
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch courses' 
      }, 
      { status: 500 }
    );
  }
}