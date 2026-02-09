/**
 * Performance Insights API implementation
 * Analyzes student performance data to generate actionable insights
 */

// Type definitions
export interface CourseItem {
  item_id: string;
  student_id: string;
  course_id: string;
  item_type: string;
  title: string;
  points_possible: number;
  latest_score: number | null;
  attempt_count: number;
  last_submitted_at?: string;
  due_date?: string;
  status?: string;
  attempts?: Array<{
    attempt_no: number;
    submitted_at: string;
    score: number;
    questions?: Array<{
      topic: string;
      correct_answer: string;
      student_answer: string;
      is_correct: boolean;
    }>;
    submission?: {
      files: string[];
    };
  }>;
  feedback?: Array<{
    comment: string;
  }>;
}

export interface PerformanceInsight {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  advice: string;
}

/**
 * Analyzes student performance data to generate insights
 * @param studentId The student ID
 * @param courseId Optional course ID to filter by
 * @param courseItems Course items data
 * @returns Performance insights
 */
export function analyzePerformance(
  studentId: string,
  courseId?: string,
  courseItems?: CourseItem[]
): PerformanceInsight {
  // Return default insights if no course items available
  if (!courseItems || courseItems.length === 0) {
    return getDefaultInsights(courseId);
  }

  // Filter items by course ID if provided
  const filteredItems = courseId 
    ? courseItems.filter(item => item.course_id === courseId)
    : courseItems;

  // Extract strengths and weaknesses based on scores and attempts
  const { strengths, weaknesses } = identifyStrengthsAndWeaknesses(filteredItems);

  // Generate summary based on overall performance
  const summary = generateSummary(filteredItems, strengths, weaknesses);

  // Generate advice based on weaknesses and upcoming items
  const advice = generateAdvice(filteredItems, weaknesses);

  return {
    summary,
    strengths,
    weaknesses,
    advice
  };
}

/**
 * Identifies strengths and weaknesses based on course items
 * @param items Course items to analyze
 * @returns Strengths and weaknesses arrays
 */
function identifyStrengthsAndWeaknesses(items: CourseItem[]): { 
  strengths: string[],
  weaknesses: string[]
} {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const topicPerformance = new Map<string, { 
    correct: number, 
    total: number, 
    latestCorrect: boolean,
    attempts: number
  }>();

  // Process each item with attempts
  items.forEach(item => {
    if (!item.attempts || item.attempts.length === 0) return;

    const latestAttempt = item.attempts[item.attempts.length - 1];
    
    // Handle items with questions (like quizzes)
    if (latestAttempt.questions && latestAttempt.questions.length > 0) {
      latestAttempt.questions.forEach(question => {
        const topic = question.topic;
        
        if (!topicPerformance.has(topic)) {
          topicPerformance.set(topic, { 
            correct: question.is_correct ? 1 : 0, 
            total: 1,
            latestCorrect: question.is_correct,
            attempts: item.attempt_count
          });
        } else {
          const current = topicPerformance.get(topic)!;
          current.correct += question.is_correct ? 1 : 0;
          current.total += 1;
          current.latestCorrect = question.is_correct;
          current.attempts = Math.max(current.attempts, item.attempt_count);
        }
      });
    } 
    // Handle items without questions (like assignments)
    else if (item.latest_score !== null) {
      // Extract topic from title
      const topic = item.title.replace(/^(quiz|assignment|exam)\s+\d+\s*:/i, '').trim();
      const scoreRatio = item.latest_score / item.points_possible;
      const isCorrect = scoreRatio >= 0.8; // Consider 80%+ as correct
      
      if (!topicPerformance.has(topic)) {
        topicPerformance.set(topic, { 
          correct: isCorrect ? 1 : 0, 
          total: 1,
          latestCorrect: isCorrect,
          attempts: item.attempt_count
        });
      } else {
        const current = topicPerformance.get(topic)!;
        current.correct += isCorrect ? 1 : 0;
        current.total += 1;
        current.latestCorrect = isCorrect;
        current.attempts = Math.max(current.attempts, item.attempt_count);
      }
    }
  });

  // Classify topics as strengths or weaknesses
  topicPerformance.forEach((performance, topic) => {
    const successRate = performance.correct / performance.total;
    
    if (successRate >= 0.8 && performance.latestCorrect) {
      strengths.push(topic);
    } 
    else if (successRate < 0.6 || !performance.latestCorrect) {
      weaknesses.push(topic);
    }
    // Topics with success rate between 0.6 and 0.8 are neither strengths nor weaknesses
  });

  return { strengths, weaknesses };
}

/**
 * Generates a summary based on overall performance
 * @param items Course items
 * @param strengths Identified strengths
 * @param weaknesses Identified weaknesses
 * @returns Summary string
 */
function generateSummary(
  items: CourseItem[],
  strengths: string[],
  weaknesses: string[]
): string {
  // Calculate overall performance metrics
  let totalScore = 0;
  let totalPossible = 0;
  let completedItems = 0;

  items.forEach(item => {
    if (item.latest_score !== null) {
      totalScore += item.latest_score;
      totalPossible += item.points_possible;
      completedItems++;
    }
  });

  const overallPercentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
  const completionRate = items.length > 0 ? (completedItems / items.length) * 100 : 0;

  // Generate summary text
  let summary = '';

  if (overallPercentage >= 90) {
    summary = `Excellent performance with an overall score of ${overallPercentage.toFixed(1)}%. `;
  } else if (overallPercentage >= 80) {
    summary = `Strong performance with an overall score of ${overallPercentage.toFixed(1)}%. `;
  } else if (overallPercentage >= 70) {
    summary = `Good performance with an overall score of ${overallPercentage.toFixed(1)}%. `;
  } else if (overallPercentage >= 60) {
    summary = `Satisfactory performance with an overall score of ${overallPercentage.toFixed(1)}%. `;
  } else if (overallPercentage > 0) {
    summary = `Needs improvement with an overall score of ${overallPercentage.toFixed(1)}%. `;
  } else {
    summary = 'No completed assessments yet. ';
  }

  // Add strengths and weaknesses to summary
  if (strengths.length > 0) {
    summary += `Showing strength in ${strengths.length} topic${strengths.length > 1 ? 's' : ''}. `;
  }
  
  if (weaknesses.length > 0) {
    summary += `Needs more practice in ${weaknesses.length} topic${weaknesses.length > 1 ? 's' : ''}. `;
  }

  // Add completion rate
  summary += `Completed ${completedItems} out of ${items.length} items (${completionRate.toFixed(1)}%).`;

  return summary;
}

/**
 * Generates advice based on weaknesses and upcoming items
 * @param items Course items
 * @param weaknesses Identified weaknesses
 * @returns Advice string
 */
function generateAdvice(items: CourseItem[], weaknesses: string[]): string {
  // Look for upcoming items
  const upcomingItems = items.filter(item => 
    item.status === 'upcoming' && item.due_date && new Date(item.due_date) > new Date()
  ).sort((a, b) => 
    new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
  );

  let advice = '';

  // Advise based on weaknesses
  if (weaknesses.length > 0) {
    advice += `Focus on strengthening your understanding of ${weaknesses.slice(0, 3).join(', ')}`;
    if (weaknesses.length > 3) {
      advice += `, and other weak areas`;
    }
    advice += '. ';
  }

  // Advise based on upcoming items
  if (upcomingItems.length > 0) {
    const nextItem = upcomingItems[0];
    const dueDate = new Date(nextItem.due_date!);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    advice += `Prepare for your upcoming ${nextItem.item_type} on "${nextItem.title}" `;
    
    if (daysUntilDue <= 1) {
      advice += `due today`;
    } else if (daysUntilDue === 1) {
      advice += `due tomorrow`;
    } else {
      advice += `due in ${daysUntilDue} days`;
    }
    
    advice += '.';
  }

  // Default advice if no specific advice was generated
  if (!advice) {
    advice = 'Continue practicing consistently and review your course materials regularly.';
  }

  return advice;
}

/**
 * Returns default insights when no data is available
 * @param courseId Optional course ID
 * @returns Default performance insights
 */
function getDefaultInsights(courseId?: string): PerformanceInsight {
  return {
    summary: `No detailed performance data available${courseId ? ` for course ${courseId}` : ''}.`,
    strengths: [],
    weaknesses: [],
    advice: 'Complete some assessments to get personalized insights.'
  };
}