import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const { courseId } = params;

  if (!courseId) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Course ID is required' 
      }, 
      { status: 400 }
    );
  }

  try {
    // Query to get all materials for the specified course
    const materialsResult = await query(`
      SELECT material_id, course_id, material_type, week, title, 
             filename, canvas_url, file_url, text_instruction
      FROM course_materials
      WHERE course_id = $1
      ORDER BY week ASC, title ASC;
    `, [courseId]);

    const materials = materialsResult.rows;
    
    return NextResponse.json({ 
      success: true, 
      materials: materials 
    });
  } catch (error: any) {
    console.error('Error fetching course materials:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch course materials' 
      }, 
      { status: 500 }
    );
  }
}