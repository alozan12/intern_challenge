/**
 * Learning Gap Detection Algorithm
 * Analyzes student performance to identify learning gaps and weaknesses
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

export interface LearningGap {
  topic: string;
  confidence: 'high' | 'medium' | 'low';
  recommended_review: boolean;
  based_on?: Array<{
    item_id: string;
    item_type: string;
    title: string;
    attempt_count: number;
    initially_correct: boolean;
    resolved: boolean;
  }>;
  last_practiced?: string;
}

export interface UpcomingTopic {
  topic: string;
  related_items: Array<{
    item_id: string;
    item_type: string;
    title: string;
    due_date: string;
  }>;
  pre_study_recommended: boolean;
}

export interface CourseLearningGaps {
  course_id: string;
  course_code?: string;
  gaps: LearningGap[];
  upcoming_topics?: UpcomingTopic[];
}

/**
 * Detects learning gaps based on student performance data
 * @param studentId Student ID
 * @param courseId Optional course ID filter
 * @param courseItems Student's course items (quizzes, assignments, etc.)
 * @returns Detected learning gaps by course
 */
export function detectLearningGaps(
  studentId: string,
  courseId?: string,
  courseItems?: CourseItem[]
): CourseLearningGaps[] {
  // If no course items provided, return empty result
  if (!courseItems || courseItems.length === 0) {
    return [];
  }

  // Filter items by course ID if provided
  const filteredItems = courseId
    ? courseItems.filter(item => item.course_id === courseId)
    : courseItems;

  // Group items by course
  const courseGroups = groupByCourse(filteredItems);

  // Analyze each course
  const result = Object.entries(courseGroups).map(([id, items]) => {
    // Extract learning gaps
    const gaps = identifyGaps(items);
    
    // Extract upcoming topics
    const upcoming = identifyUpcomingTopics(items);
    
    return {
      course_id: id,
      gaps,
      upcoming_topics: upcoming
    };
  });

  return result;
}

/**
 * Groups course items by course ID
 * @param items Course items
 * @returns Object with course IDs as keys and arrays of items as values
 */
function groupByCourse(items: CourseItem[]): Record<string, CourseItem[]> {
  const groups: Record<string, CourseItem[]> = {};
  
  items.forEach(item => {
    if (!groups[item.course_id]) {
      groups[item.course_id] = [];
    }
    
    groups[item.course_id].push(item);
  });
  
  return groups;
}

/**
 * Identifies learning gaps from course items
 * @param items Course items
 * @returns Array of learning gaps
 */
function identifyGaps(items: CourseItem[]): LearningGap[] {
  const topicPerformance = new Map<string, {
    attempts: number;
    incorrect: number;
    correct: number;
    initiallyCorrect: boolean;
    lastCorrect: boolean;
    lastPracticed: string;
    itemReferences: Map<string, {
      id: string;
      type: string;
      title: string;
      attemptCount: number;
    }>;
  }>();

  // Analyze completed items
  const completedItems = items.filter(
    item => item.latest_score !== null && item.attempts && item.attempts.length > 0
  );

  // Process each completed item
  completedItems.forEach(item => {
    // Get the first and latest attempt
    const firstAttempt = item.attempts![0];
    const latestAttempt = item.attempts![item.attempts!.length - 1];
    const lastPracticed = latestAttempt.submitted_at;

    // Process items with questions (like quizzes)
    if (latestAttempt.questions && latestAttempt.questions.length > 0) {
      latestAttempt.questions.forEach(question => {
        const topic = question.topic;
        
        // Get the corresponding question from first attempt if available
        const firstQuestion = firstAttempt.questions?.find(q => q.topic === topic);
        const initiallyCorrect = firstQuestion?.is_correct || false;
        
        // Update or create topic performance data
        if (!topicPerformance.has(topic)) {
          topicPerformance.set(topic, {
            attempts: item.attempt_count,
            incorrect: question.is_correct ? 0 : 1,
            correct: question.is_correct ? 1 : 0,
            initiallyCorrect,
            lastCorrect: question.is_correct,
            lastPracticed,
            itemReferences: new Map([[item.item_id, {
              id: item.item_id,
              type: item.item_type,
              title: item.title,
              attemptCount: item.attempt_count
            }]])
          });
        } else {
          const perf = topicPerformance.get(topic)!;
          
          // Update metrics
          perf.attempts = Math.max(perf.attempts, item.attempt_count);
          perf.incorrect += question.is_correct ? 0 : 1;
          perf.correct += question.is_correct ? 1 : 0;
          perf.initiallyCorrect = perf.initiallyCorrect && initiallyCorrect;
          perf.lastCorrect = perf.lastCorrect && question.is_correct;
          
          // Update last practiced date if newer
          if (new Date(lastPracticed) > new Date(perf.lastPracticed)) {
            perf.lastPracticed = lastPracticed;
          }
          
          // Add item reference
          perf.itemReferences.set(item.item_id, {
            id: item.item_id,
            type: item.item_type,
            title: item.title,
            attemptCount: item.attempt_count
          });
        }
      });
    } 
    // Process items without questions (like assignments)
    else {
      // Extract topic from item title
      const topic = extractTopicFromTitle(item.title);
      if (!topic) return;
      
      // Calculate scores
      const firstScore = firstAttempt.score / item.points_possible;
      const latestScore = latestAttempt.score / item.points_possible;
      
      // Determine correctness thresholds
      const initiallyCorrect = firstScore >= 0.8;
      const lastCorrect = latestScore >= 0.8;
      
      // Create or update topic performance
      if (!topicPerformance.has(topic)) {
        topicPerformance.set(topic, {
          attempts: item.attempt_count,
          incorrect: lastCorrect ? 0 : 1,
          correct: lastCorrect ? 1 : 0,
          initiallyCorrect,
          lastCorrect,
          lastPracticed,
          itemReferences: new Map([[item.item_id, {
            id: item.item_id,
            type: item.item_type,
            title: item.title,
            attemptCount: item.attempt_count
          }]])
        });
      } else {
        const perf = topicPerformance.get(topic)!;
        
        // Update metrics
        perf.attempts = Math.max(perf.attempts, item.attempt_count);
        perf.incorrect += lastCorrect ? 0 : 1;
        perf.correct += lastCorrect ? 1 : 0;
        perf.initiallyCorrect = perf.initiallyCorrect && initiallyCorrect;
        perf.lastCorrect = perf.lastCorrect && lastCorrect;
        
        // Update last practiced date if newer
        if (new Date(lastPracticed) > new Date(perf.lastPracticed)) {
          perf.lastPracticed = lastPracticed;
        }
        
        // Add item reference
        perf.itemReferences.set(item.item_id, {
          id: item.item_id,
          type: item.item_type,
          title: item.title,
          attemptCount: item.attempt_count
        });
      }
    }
  });

  // Convert topic performance to learning gaps
  const gaps: LearningGap[] = [];
  
  topicPerformance.forEach((perf, topic) => {
    // Calculate success rate
    const total = perf.correct + perf.incorrect;
    const successRate = total > 0 ? perf.correct / total : 0;
    
    // Determine confidence level
    let confidence: 'high' | 'medium' | 'low';
    
    if (successRate >= 0.8 && perf.lastCorrect) {
      confidence = 'high';
    } else if (successRate >= 0.6) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }
    
    // Determine if it's a gap - only include if confidence is not high or it wasn't initially correct
    if (confidence !== 'high' || !perf.initiallyCorrect) {
      const based_on = Array.from(perf.itemReferences.values()).map(ref => ({
        item_id: ref.id,
        item_type: ref.type,
        title: ref.title,
        attempt_count: ref.attemptCount,
        initially_correct: perf.initiallyCorrect,
        resolved: perf.lastCorrect
      }));
      
      gaps.push({
        topic,
        confidence,
        recommended_review: confidence !== 'high' || !perf.lastCorrect,
        based_on,
        last_practiced: perf.lastPracticed
      });
    }
  });

  // Sort gaps by recommended_review (true first) and then by confidence (low first)
  return gaps.sort((a, b) => {
    // First sort by recommended_review
    if (a.recommended_review && !b.recommended_review) return -1;
    if (!a.recommended_review && b.recommended_review) return 1;
    
    // Then sort by confidence level
    const confidenceValue = { low: 0, medium: 1, high: 2 };
    return confidenceValue[a.confidence] - confidenceValue[b.confidence];
  });
}

/**
 * Identifies upcoming topics from course items
 * @param items Course items
 * @returns Array of upcoming topics
 */
function identifyUpcomingTopics(items: CourseItem[]): UpcomingTopic[] {
  // Filter to only upcoming items with due dates
  const upcoming = items.filter(
    item => item.status === 'upcoming' && 
            item.due_date && 
            new Date(item.due_date) > new Date()
  );
  
  // Group by topic
  const topicGroups: Record<string, {
    topic: string;
    items: Array<{
      id: string;
      type: string;
      title: string;
      dueDate: string;
    }>;
  }> = {};
  
  upcoming.forEach(item => {
    const topic = extractTopicFromTitle(item.title) || item.title;
    
    if (!topicGroups[topic]) {
      topicGroups[topic] = {
        topic,
        items: []
      };
    }
    
    topicGroups[topic].items.push({
      id: item.item_id,
      type: item.item_type,
      title: item.title,
      dueDate: item.due_date!
    });
  });
  
  // Convert to UpcomingTopic array
  const upcomingTopics = Object.values(topicGroups).map(group => ({
    topic: group.topic,
    related_items: group.items.map(item => ({
      item_id: item.id,
      item_type: item.type,
      title: item.title,
      due_date: item.dueDate
    })),
    pre_study_recommended: true
  }));
  
  // Sort by earliest due date
  return upcomingTopics.sort((a, b) => {
    const aDate = new Date(a.related_items[0].due_date).getTime();
    const bDate = new Date(b.related_items[0].due_date).getTime();
    return aDate - bDate;
  });
}

/**
 * Extracts a topic from an item title
 * @param title Item title (e.g., "Quiz 1: Arrays and Linked Lists")
 * @returns Extracted topic (e.g., "arrays and linked lists")
 */
function extractTopicFromTitle(title: string): string | null {
  // Remove common prefixes like "Quiz 1:" or "Assignment 2:"
  const cleaned = title.replace(/^(quiz|assignment|exam)\s+\d+\s*:/i, '').trim();
  
  // Return null if there's no meaningful content left
  if (!cleaned) {
    return null;
  }
  
  return cleaned.toLowerCase();
}