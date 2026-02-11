import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// For now, we'll hardcode the student ID
// In a real app, this would come from authentication
const CURRENT_STUDENT_ID = '987655';

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
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch courses' 
      }, 
      { status: 500 }
    );
  }
}