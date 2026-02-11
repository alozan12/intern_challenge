import learningGapsData from './learning-gaps.json';

/**
 * Get learning gaps for a specific student and course
 */
export function getLearningGaps(studentId: string, courseId?: string) {
  // Filter by student
  if (!studentId) {
    return {};
  }

  // Get the student's learning gaps
  const studentGaps = learningGapsData.student_id === studentId ? 
    learningGapsData.identified_gaps : [];
  
  // Filter by course if provided
  if (courseId) {
    return studentGaps.find(course => course.course_id === courseId) || {};
  }
  
  // Return all student learning gaps if no course filter
  return studentGaps;
}

/**
 * Get recommended spaced repetition topics for a student
 */
export function getSpacedRepetition(studentId: string, courseId?: string) {
  // Filter by student
  if (!studentId || studentId !== learningGapsData.student_id) {
    return [];
  }

  // Filter by course if provided
  if (courseId) {
    return learningGapsData.recommended_spaced_repetition.filter(
      topic => topic.course_id === courseId
    );
  }
  
  // Return all spaced repetition topics if no course filter
  return learningGapsData.recommended_spaced_repetition;
}

/**
 * Get strength areas for a student
 */
export function getStrengthAreas(studentId: string, courseId?: string) {
  // Filter by student
  if (!studentId || studentId !== learningGapsData.student_id) {
    return [];
  }

  // Get the student's strength areas
  const strengthAreas = learningGapsData.strength_areas;
  
  // Filter by course if provided
  if (courseId) {
    return strengthAreas.find(course => course.course_id === courseId) || {};
  }
  
  // Return all strength areas if no course filter
  return strengthAreas;
}