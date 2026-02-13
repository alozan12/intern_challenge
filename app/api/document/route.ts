import { NextRequest, NextResponse } from 'next/server';
import { generateInsight, queryCreateAI } from '@/lib/createAI';
import { createAIStream } from '@/lib/compatAI';
import { getLearningGaps } from '@/mocks/learning-gaps';
import { StreamResponse } from '@/lib/utils';
// TextEncoder for the Edge runtime
const encoder = new TextEncoder();

// Define interfaces for document requests and responses
interface DocumentRequest {
  studentId: string;
  courseId?: string;
  documentType?: 'flashcards' | 'quiz' | 'outline';
  topic?: string;
  stream?: boolean;
  selectedContent?: string[];
  generationType?: 'learning_gaps' | 'selected_content';
}

interface Flashcard {
  front: string;
  back: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

// Create the AI document generator
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { studentId, courseId, documentType = 'flashcards', topic, stream = false, selectedContent = [], generationType = 'selected_content' }: DocumentRequest = await req.json();
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }
    
    // Get learning gaps for context
    const learningGapsData = getLearningGaps(studentId, courseId);
    
    // Define prompts based on document type
    let systemPrompt = 'You are the ASU Study Coach document generator, an AI assistant that creates personalized study materials based on student needs and learning patterns.';
    let userPrompt = '';
    
    switch (documentType) {
      case 'flashcards':
        systemPrompt += '\n\nYour task is to generate educational flashcards on the specified topic, focusing on key concepts and addressing potential learning gaps.';
        systemPrompt += '\n\nFollow these guidelines:';
        systemPrompt += '\n- Create 5-10 flashcards covering key concepts';
        systemPrompt += '\n- Ensure each flashcard is concise and focused on a single concept';
        systemPrompt += '\n- Balance basic concepts with more advanced ones';
        systemPrompt += '\n- Include visual descriptions where helpful';
        systemPrompt += '\n- Pay special attention to topics identified as learning gaps';
        
        systemPrompt += '\n\nFormat your response as a JSON object with a "flashcards" array of objects, each containing:';
        systemPrompt += '\n- front: The question or concept (50-200 characters)';
        systemPrompt += '\n- back: The answer or explanation (50-300 characters)';
        
        userPrompt = `Generate a set of flashcards about ${topic || 'key concepts'} for a student studying this subject.`;
        break;
        
      case 'quiz':
        systemPrompt += '\n\nYour task is to generate quiz questions on the specified topic, focusing on assessing understanding of key concepts and identifying potential learning gaps.';
        systemPrompt += '\n\nFollow these guidelines:';
        systemPrompt += '\n- Create 5-8 diverse questions of varying difficulty';
        systemPrompt += '\n- Use a mix of question types (multiple choice predominant)';
        systemPrompt += '\n- Ensure distractors (wrong answers) are plausible';
        systemPrompt += '\n- Include explanations that are educational';
        systemPrompt += '\n- Target concepts identified as learning gaps when available';
        
        systemPrompt += '\n\nFormat your response as a JSON object with a "questions" array of objects, each containing:';
        systemPrompt += '\n- question: The question text (100-300 characters)';
        systemPrompt += '\n- options: Array of 4 possible answers for multiple choice';
        systemPrompt += '\n- answer: The correct answer (for multiple choice, the correct option)';
        systemPrompt += '\n- explanation: Why the answer is correct (100-300 characters)';
        
        userPrompt = `Generate a comprehensive quiz about ${topic || 'key concepts'} for a student studying this subject.`;
        break;
        
      case 'outline':
        systemPrompt += '\n\nYour task is to generate a structured study outline on the specified topic, organizing key concepts into logical sections.';
        systemPrompt += '\n\nFollow these guidelines:';
        systemPrompt += '\n- Create a comprehensive outline with 3-5 main sections';
        systemPrompt += '\n- Structure content hierarchically with clear relationships';
        systemPrompt += '\n- Include both foundational and advanced topics';
        systemPrompt += '\n- Cover topics identified as learning gaps when available';
        systemPrompt += '\n- Ensure the outline flows logically from basic to complex concepts';
        
        systemPrompt += '\n\nFormat your response as a JSON object with:';
        systemPrompt += '\n- title: The main title of the outline';
        systemPrompt += '\n- sections: An array of section objects, each containing:';
        systemPrompt += '\n  - title: The section heading';
        systemPrompt += '\n  - topics: An array of topics covered in this section';
        systemPrompt += '\n  - subsections: (optional) An array of nested section objects with the same structure';
        
        userPrompt = `Create a comprehensive study outline about ${topic || 'key concepts'} for a student studying this subject.`;
        break;
    }
    
    // Add context about learning gaps if using learning_gaps generationType
    if (generationType === 'learning_gaps' && learningGapsData && typeof learningGapsData === 'object' && Object.keys(learningGapsData).length > 0) {
      userPrompt += ' Focus especially on addressing these learning gaps and concepts the student needs to improve on. Target content at the right difficulty level to help them build confidence in these areas.';
    }
    
    // Add context about selected content if available and using selected_content generationType
    if (generationType === 'selected_content' && selectedContent && selectedContent.length > 0) {
      userPrompt += ` Focus specifically on the following selected content: ${selectedContent.join(', ')}. Create materials that directly address these specific topics without straying to other areas.`;
    }
    
    // Specify that the AI should focus on education quality
    userPrompt += ' Your goal is to create high-quality, educational content that helps the student master the material through active learning and recall practice.'
    
    // Prepare enhanced context for AI
    const aiContext = {
      studentInfo: {
        id: studentId,
        learningGaps: learningGapsData,
        courseId
      },
      contentRequest: {
        type: documentType,
        topic,
        generationType,
        selectedContent: selectedContent && selectedContent.length > 0 ? selectedContent : [],
        focusAreas: generationType === 'learning_gaps' ? getTopicsFromLearningGaps(learningGapsData) : []
      },
      // Inject sample format to guide the model
      formatExample: getSampleFormat(documentType)
    };
    
    // Set up options for CreateAI API
    const options = {
      modelProvider: 'aws',
      modelName: 'claude4_5_sonnet',
      sessionId: `document_${studentId}_${documentType}_${Date.now()}`,
      systemPrompt,
      temperature: 0.7, // Slightly higher for more creative educational content
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
          // For document generation, we don't typically need search
          enableSearch: false // Always disable search
        }
      });
      
      return new StreamResponse(streamingResponse as ReadableStream);
    }
    
    // For non-streaming responses
    const response = await queryCreateAI(userPrompt, options);
    
    // If there's an error with the direct API, fall back to using mock data
    if (response.error) {
      console.warn('Direct API call failed, falling back to mock data:', response.error);
      
      // Return mock data based on document type
      return NextResponse.json({
        type: documentType,
        data: getMockDocumentData(documentType, topic),
        metadata: {
          topic,
          generatedAt: new Date().toISOString(),
          focusAreas: getTopicsFromLearningGaps(learningGapsData)
        }
      });
    }
    
    // Return the response from the API
    return NextResponse.json({
      type: documentType,
      data: response.data || getMockDocumentData(documentType, topic),
      metadata: {
        topic,
        generatedAt: new Date().toISOString(),
        focusAreas: getTopicsFromLearningGaps(learningGapsData)
      }
    });
  } catch (error) {
    console.error('Error in document generation API:', error);
    return NextResponse.json(
      { error: 'Failed to generate study material' },
      { status: 500 }
    );
  }
}

/**
 * Extract topics from learning gaps data
 */
function getTopicsFromLearningGaps(learningGapsData: any): string[] {
  try {
    // Handle different shapes of learning gaps data
    if (learningGapsData && learningGapsData.gaps && Array.isArray(learningGapsData.gaps)) {
      return learningGapsData.gaps.map((gap: any) => gap.topic);
    } else if (learningGapsData && Array.isArray(learningGapsData.identified_gaps)) {
      // Extract topics from the first course's gaps
      const firstCourse = learningGapsData.identified_gaps[0];
      if (firstCourse && Array.isArray(firstCourse.gaps)) {
        return firstCourse.gaps.map((gap: any) => gap.topic);
      }
    }
    return ['general concepts'];
  } catch (error) {
    console.error('Error extracting topics from learning gaps:', error);
    return ['general concepts'];
  }
}

/**
 * Provides sample format for each document type to guide the AI
 */
function getSampleFormat(documentType: string): any {
  switch (documentType) {
    case 'flashcards':
      return {
        "flashcards": [
          {
            "front": "What is the time complexity of search in a balanced binary search tree?",
            "back": "O(log n)"
          },
          {
            "front": "What is an AVL tree?",
            "back": "A self-balancing binary search tree where the heights of two child subtrees differ by at most one."
          }
        ]
      };
    
    case 'quiz':
      return {
        "questions": [
          {
            "question": "What is the time complexity of search in a balanced binary search tree?",
            "options": ["O(1)", "O(log n)", "O(n)", "O(n²)"],
            "answer": "O(log n)",
            "explanation": "In a balanced BST, each comparison eliminates half of the remaining elements."
          },
          {
            "question": "Which tree maintains height balance through AVL rotations?",
            "options": ["Binary Tree", "Red-Black Tree", "AVL Tree", "B-Tree"],
            "answer": "AVL Tree",
            "explanation": "AVL trees use rotations to maintain a balance factor of -1, 0, or 1 for all nodes."
          }
        ]
      };
      
    case 'outline':
    default:
      return {
        "title": "Binary Search Trees Study Guide",
        "sections": [
          {
            "title": "BST Fundamentals",
            "topics": ["Definition", "Properties", "Representation"]
          },
          {
            "title": "Tree Balancing",
            "topics": ["AVL Trees", "Red-Black Trees", "Rotations"],
            "subsections": [
              {
                "title": "Rotation Types",
                "topics": ["Left Rotation", "Right Rotation", "Left-Right Rotation", "Right-Left Rotation"]
              }
            ]
          }
        ]
      };
  }
}

/**
 * Provides mock document data for development when API fails
 */
function getMockDocumentData(documentType: string, topic?: string): any {
  // Determine subject area from topic
  const isTreeTopic = topic?.toLowerCase().includes('tree') ?? false;
  const isGraphTopic = topic?.toLowerCase().includes('graph') ?? false;
  
  switch (documentType) {
    case 'flashcards':
      if (isTreeTopic) {
        return [
          { front: 'What is the time complexity of search in a balanced BST?', back: 'O(log n)' },
          { front: 'What is the worst-case time complexity of search in an unbalanced BST?', back: 'O(n)' },
          { front: 'What technique is used to maintain BST balance?', back: 'Tree rotations, implemented in algorithms like AVL or Red-Black trees' },
          { front: 'Why is BST search O(log n) rather than O(n)?', back: 'Because each comparison eliminates half of the remaining elements' },
          { front: 'What is an AVL tree?', back: 'A self-balancing binary search tree where heights of the two child subtrees differ by at most one' }
        ];
      } else if (isGraphTopic) {
        return [
          { front: 'When would you use BFS over DFS?', back: 'When finding the shortest path in an unweighted graph' },
          { front: 'What data structure is typically used in BFS?', back: 'Queue' },
          { front: 'What data structure is typically used in DFS?', back: 'Stack (or recursion)' }
        ];
      } else {
        return [
          { front: 'What does O(n²) time complexity mean?', back: 'The algorithm\'s runtime grows quadratically with the input size' },
          { front: 'What is the space complexity of an algorithm?', back: 'The amount of memory space required by the algorithm in relation to the input size' }
        ];
      }
      
    case 'quiz':
      if (isTreeTopic) {
        return [
          { 
            question: 'What is the time complexity for searching in a balanced binary search tree?', 
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
            answer: 'O(log n)',
            explanation: 'In a balanced BST, each comparison eliminates half of the remaining elements.'
          },
          { 
            question: 'Which of these trees is always balanced?', 
            options: ['Binary Search Tree', 'AVL Tree', 'Linked List', 'Binary Tree'],
            answer: 'AVL Tree',
            explanation: 'AVL trees maintain balance through rotations whenever the height difference between subtrees exceeds 1.'
          },
          { 
            question: 'In what case would a BST have O(n) search time?', 
            options: ['When it\'s balanced', 'When it\'s unbalanced and degenerates to a linked list', 'When it has duplicate values', 'When it\'s implemented with an array'],
            answer: 'When it\'s unbalanced and degenerates to a linked list',
            explanation: 'An unbalanced BST where each node has only one child effectively becomes a linked list with O(n) search time.'
          }
        ];
      } else if (isGraphTopic) {
        return [
          { 
            question: 'Which algorithm is best for finding the shortest path in an unweighted graph?', 
            options: ['Depth-First Search', 'Breadth-First Search', 'Dijkstra\'s Algorithm', 'A* Search'],
            answer: 'Breadth-First Search',
            explanation: 'BFS visits vertices in order of their distance from the source vertex.'
          },
          { 
            question: 'What data structure is used in BFS?', 
            options: ['Stack', 'Queue', 'Priority Queue', 'Linked List'],
            answer: 'Queue',
            explanation: 'BFS uses a queue to process vertices in the order they are discovered.'
          }
        ];
      } else {
        return [
          { 
            question: 'Which sorting algorithm has the best average-case time complexity?', 
            options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Quick Sort'],
            answer: 'Quick Sort',
            explanation: 'Quick Sort has an average time complexity of O(n log n) and generally outperforms other O(n log n) algorithms in practice.'
          }
        ];
      }
      
    case 'outline':
    default:
      if (isTreeTopic) {
        return {
          title: 'Binary Search Trees - Study Guide',
          sections: [
            {
              title: 'BST Fundamentals',
              topics: ['Definition', 'Properties', 'Representation']
            },
            {
              title: 'BST Operations',
              topics: ['Search', 'Insert', 'Delete', 'Time Complexity Analysis']
            },
            {
              title: 'Tree Balancing',
              topics: ['Balance Factor', 'AVL Trees', 'Red-Black Trees', 'Rotations']
            },
            {
              title: 'Advanced Topics',
              topics: ['Self-balancing Trees', 'B-Trees', 'Application in Databases']
            }
          ],
          focusAreas: ['BST complexity', 'tree balancing', 'edge cases']
        };
      } else if (isGraphTopic) {
        return {
          title: 'Graph Algorithms - Study Guide',
          sections: [
            {
              title: 'Graph Basics',
              topics: ['Definition', 'Representation (Adjacency Matrix/List)', 'Types of Graphs']
            },
            {
              title: 'Graph Traversal',
              topics: ['Breadth-First Search (BFS)', 'Depth-First Search (DFS)', 'Applications']
            },
            {
              title: 'Shortest Path Algorithms',
              topics: ['Dijkstra\'s Algorithm', 'Bellman-Ford Algorithm', 'Floyd-Warshall Algorithm']
            },
            {
              title: 'Minimum Spanning Trees',
              topics: ['Prim\'s Algorithm', 'Kruskal\'s Algorithm']
            }
          ],
          focusAreas: ['graph traversal algorithms', 'shortest path']
        };
      } else {
        return {
          title: 'Algorithm Analysis - Study Guide',
          sections: [
            {
              title: 'Complexity Analysis',
              topics: ['Big O Notation', 'Time Complexity', 'Space Complexity']
            },
            {
              title: 'Common Complexities',
              topics: ['Constant Time', 'Logarithmic', 'Linear', 'Quadratic', 'Exponential']
            },
            {
              title: 'Algorithm Design Paradigms',
              topics: ['Divide and Conquer', 'Dynamic Programming', 'Greedy Algorithms']
            }
          ],
          focusAreas: ['algorithm complexity', 'data structure selection']
        };
      }
  }
}