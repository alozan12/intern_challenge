import { NextRequest, NextResponse } from 'next/server';
import { queryCreateAI } from '@/lib/createAI';
import { FlashcardSet } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';
// Import flashcard prompts
import { flashcards } from '@/prompts';

// Define interfaces for flashcard generation request and response
interface FlashcardRequest {
  topic: string;
  courseId?: string;
  courseName?: string;
  courseCode?: string;
  cardCount?: number;
  difficulty?: 'basic' | 'intermediate' | 'advanced';
  generationType?: 'learning_gaps' | 'selected_content';
  studentId?: string;
  selectedContent?: string[];
}

// Remove edge runtime to allow file system access
// export const runtime = 'edge';

// Set to false to use real AI data
const USE_MOCK_DATA = false;

// Set to true to force debug output
const DEBUG_MODE = true;

// Load knowledge base data
async function loadKnowledgeBase(courseId?: string, studentId?: string) {
  try {
    const filePath = path.join(process.cwd(), 'mocks', 'course-items.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Filter by courseId and studentId if provided
    let courseItems = data.course_items || [];
    if (courseId) {
      courseItems = courseItems.filter((item: any) => item.course_id === courseId);
    }
    if (studentId) {
      courseItems = courseItems.filter((item: any) => item.student_id === studentId);
    }
    
    return courseItems;
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    return [];
  }
}

// Extract learning gaps from course items
function extractLearningGaps(courseItems: any[]) {
  const gaps = [];
  
  for (const item of courseItems) {
    if (item.attempts && item.attempts.length > 0) {
      for (const attempt of item.attempts) {
        if (attempt.questions) {
          for (const question of attempt.questions) {
            if (!question.is_correct) {
              gaps.push({
                topic: question.topic,
                correctAnswer: question.correct_answer,
                studentAnswer: question.student_answer,
                itemTitle: item.title,
                itemType: item.item_type
              });
            }
          }
        }
      }
    }
  }
  
  return gaps;
}

// Extract general content topics from course items
function extractGeneralTopics(courseItems: any[]) {
  const topics = new Set<string>();
  
  for (const item of courseItems) {
    // Add item titles as topics
    if (item.title) {
      topics.add(item.title);
    }
    
    // Extract topics from questions
    if (item.attempts && item.attempts.length > 0) {
      for (const attempt of item.attempts) {
        if (attempt.questions) {
          for (const question of attempt.questions) {
            topics.add(question.topic);
          }
        }
      }
    }
  }
  
  return Array.from(topics);
}

export async function POST(req: NextRequest) {
  console.log('Environment check:', {
    hasAPIEndpoint: !!process.env.CREATE_AI_API_ENDPOINT,
    hasAPIToken: !!process.env.CREATE_AI_API_TOKEN,
    apiEndpoint: process.env.CREATE_AI_API_ENDPOINT ? process.env.CREATE_AI_API_ENDPOINT.substring(0, 15) + '...' : 'missing'
  });
  try {
    const { topic, courseId, courseName, courseCode, cardCount = 5, difficulty = 'intermediate', generationType = 'selected_content', studentId, selectedContent = [] }: FlashcardRequest = await req.json();
    
    // If using mock data, return immediately
    if (USE_MOCK_DATA) {
      console.log('Using mock data as configured');
      const mockCards = getMockFlashcards(topic, cardCount, generationType === 'learning_gaps');
      return NextResponse.json({ flashcards: mockCards });
    }
    
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }
    
    // Load knowledge base data
    const courseItems = await loadKnowledgeBase(courseId, studentId);
    console.log('Loaded course items:', courseItems.length);
    
    // Extract relevant content based on generation type
    let knowledgeContext = '';
    
    if (generationType === 'learning_gaps') {
      const learningGaps = extractLearningGaps(courseItems);
      console.log('Found learning gaps:', learningGaps.length);
      
      if (learningGaps.length > 0) {
        knowledgeContext = `\n\nBased on the student's past performance, they have struggled with the following concepts:\n${learningGaps.map(gap => 
          `- ${gap.topic}: Student answered "${gap.studentAnswer}" but correct answer is "${gap.correctAnswer}" (from ${gap.itemTitle})`
        ).join('\n')}\n\nFocus your flashcards on these specific areas where the student needs improvement.`;
      }
    } else if (generationType === 'selected_content' && selectedContent && selectedContent.length > 0) {
      console.log('Using selected content:', selectedContent.length);
      
      knowledgeContext = `\n\nFocus on the following selected content:\n${selectedContent.map(content => `- ${content}`).join('\n')}\n\nCreate flashcards that specifically cover this selected content.`;
    } else {
      const generalTopics = extractGeneralTopics(courseItems);
      console.log('Found general topics:', generalTopics.length);
      
      if (generalTopics.length > 0) {
        knowledgeContext = `\n\nThe course covers the following topics based on past assessments:\n${generalTopics.map(topic => `- ${topic}`).join('\n')}\n\nCreate flashcards that cover these course topics comprehensively.`;
      }
    }
    
    // Set up system prompt and user prompt using imported templates
    let systemPrompt = '';
    let userPrompt = '';
    
    if (generationType === 'learning_gaps') {
      systemPrompt = flashcards.learningGapsSystemPrompt(cardCount);
      userPrompt = flashcards.learningGapsUserPrompt(cardCount, difficulty, topic, courseName, courseCode, knowledgeContext);
    } else {
      systemPrompt = flashcards.generalContentSystemPrompt(cardCount);
      userPrompt = flashcards.generalContentUserPrompt(cardCount, difficulty, topic, courseName, courseCode, knowledgeContext);
    }
    
    // Set up options for CreateAI API
    const options = {
      modelProvider: 'gcp-deepmind', // Use Google's Gemini models
      modelName: 'geminiflash3', // Gemini Flash 3 model
      sessionId: `flashcards_${Date.now()}`,
      systemPrompt,
      temperature: 0.7, // Higher temperature for more varied and creative responses
      context: {
        topic,
        courseId,
        courseName,
        courseCode,
        cardCount,
        difficulty,
        generationType,
        studentId,
        knowledgeBase: knowledgeContext,
        timestamp: new Date().toISOString(),
        uniqueId: Math.random().toString(36).substring(7)
      }
    };
    
    // Call the CreateAI API
    console.log('Calling CreateAI with:', { userPrompt });
    try {
      console.log('Calling CreateAI with options:', JSON.stringify(options, null, 2));
      const response = await queryCreateAI<{ response: string }>(userPrompt, options);
      console.log('CreateAI response status:', response.status);
      console.log('CreateAI response error:', response.error || 'None');
      console.log('CreateAI response data:', response.data ? JSON.stringify(response.data).substring(0, 200) + '...' : 'No data');
      console.log('CreateAI response data length:', response.data ? (response.data.response ? response.data.response.length : 'No response field') : 'No data');
      
      if (!response.data || response.error) {
        console.log('FALLING BACK TO MOCK DATA due to missing response data or error');
        console.error('Error generating flashcards:', response.error);
        
        // Return error to client instead of silently using mock data
        console.error('API error:', response.error);
        return NextResponse.json(
          { error: `API error: ${response.error}` },
          { status: 500 }
        );
      }
    
    // This section is now handled inside the try/catch block
    
      try {
        // Parse the AI response as JSON
        let responseData = {};
        let responseText = '';
        
        // Extract response data with several fallback methods
        if (response.data?.response) {
          responseText = response.data.response;
          console.log('Found response in response.data.response');
        } else if (response.data) {
          responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
          console.log('Using full response.data as text');
        } else {
          responseText = '{}';
          console.log('No data in response, using empty object');
        }
        
        console.log('Raw response text (first 200 chars):', responseText.substring(0, 200));
        
        // STEP 1: First, try to see if the response is already clean JSON
        try {
          responseData = JSON.parse(responseText);
          console.log('Parsed response directly as JSON');
        } catch (initialParseError) {
          console.log('Direct JSON parse failed:', initialParseError instanceof Error ? initialParseError.message : initialParseError);
          
          // STEP 2: Extract JSON from markdown code blocks
          if (responseText.includes('```json') || responseText.includes('```')) {
            console.log('Trying to extract from code blocks');
            // Try json code block first
            let jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
            // If not found, try any code block
            if (!jsonMatch) {
              jsonMatch = responseText.match(/```\s*([\s\S]*?)\s*```/);
            }
            
            if (jsonMatch && jsonMatch[1]) {
              console.log('Found content in code block, trying to parse');
              try {
                responseData = JSON.parse(jsonMatch[1]);
                console.log('Successfully parsed JSON from code block');
              } catch (blockParseError) {
                console.error('Error parsing JSON from code block:', blockParseError instanceof Error ? blockParseError.message : blockParseError);
                // Continue to next method
              }
            }
          }
          
          // STEP 3: If still no valid JSON, try to extract JSON from anywhere in the text
          if (Object.keys(responseData).length === 0 && responseText.includes('{') && responseText.includes('}')) {
            console.log('Trying to extract JSON from text content');
            const possibleJson = responseText.substring(
              responseText.indexOf('{'),
              responseText.lastIndexOf('}') + 1
            );
            
            try {
              responseData = JSON.parse(possibleJson);
              console.log('Successfully extracted JSON from text content');
            } catch (extractParseError) {
              console.error('Error parsing extracted JSON:', extractParseError instanceof Error ? extractParseError.message : extractParseError);
              // Continue to next method
            }
          }
          
          // STEP 4: If all parsing attempts fail, try to create a structured object from unstructured text
          if (Object.keys(responseData).length === 0) {
            console.log('All JSON parsing attempts failed, trying to extract cards manually');
            // Simple regex to find front/back or term/definition patterns
            const cardMatches = responseText.match(/["']?(?:front|term)["']?\s*[:=]\s*["']([^"']+)["'].*?["']?(?:back|definition)["']?\s*[:=]\s*["']([^"']+)["']/gi);
            
            if (cardMatches && cardMatches.length > 0) {
              console.log('Found potential card matches with regex:', cardMatches.length);
              try {
                const extractedCards = cardMatches.map(match => {
                  const frontMatch = match.match(/["']?(?:front|term)["']?\s*[:=]\s*["']([^"']+)["']/i);
                  const backMatch = match.match(/["']?(?:back|definition)["']?\s*[:=]\s*["']([^"']+)["']/i);
                  return {
                    front: frontMatch ? frontMatch[1] : 'Unknown term',
                    back: backMatch ? backMatch[1] : 'Unknown definition'
                  };
                }).filter(card => card.front !== 'Unknown term' || card.back !== 'Unknown definition');
                
                if (extractedCards.length > 0) {
                  responseData = { cards: extractedCards };
                  console.log('Created structured cards from text:', extractedCards.length);
                }
              } catch (regexError) {
                console.error('Error extracting cards with regex:', regexError instanceof Error ? regexError.message : regexError);
              }
            }
          }
          
          // If we still have no data, throw an error
          if (Object.keys(responseData).length === 0) {
            throw new Error('Could not extract any structured data from the response');
          }
        }
      
      // Debug the response structure
      console.log('Response data structure:', {
        hasCards: !!(responseData as any).cards,
        isCardsArray: Array.isArray((responseData as any).cards),
        responseKeys: Object.keys(responseData),
        firstLevel: JSON.stringify(responseData).substring(0, 200)
      });
      
      // Try to find cards in different possible locations in the response
      let cards = [];
      
      if (Array.isArray((responseData as any).cards)) {
        console.log('Found cards in responseData.cards');
        cards = (responseData as any).cards;
      } else if ((responseData as any).response && typeof (responseData as any).response === 'object' && Array.isArray((responseData as any).response.cards)) {
        console.log('Found cards in responseData.response.cards');
        cards = (responseData as any).response.cards;
      } else if (typeof responseData === 'string') {
        try {
          const parsedString = JSON.parse(responseData);
          if (Array.isArray(parsedString.cards)) {
            console.log('Found cards after parsing responseData string');
            cards = parsedString.cards;
          }
        } catch (parseError) {
          console.log('Could not parse responseData as string:', parseError);
        }
      } else {
        console.log('Could not find cards array in response');
      }
      
      // Ensure each card has the required properties and format
      const formattedCards = cards.map((card: any, index: number) => ({
        id: `${topic.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
        front: card.front || card.term || '',
        back: card.back || card.definition || ''
      }));
      
      // Create the flashcard set
      const flashcardSet: FlashcardSet = {
        id: `${topic.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        type: 'flashcards',
        title: `${topic} - Flashcards${generationType === 'learning_gaps' ? ' (Learning Gaps)' : ''}`,
        createdAt: new Date(),
        content: {
          cards: formattedCards
        }
      };
      
      console.log('Formatted cards count:', formattedCards.length);
      if (formattedCards.length === 0) {
        console.log('No cards were generated by AI');
        // Return error instead of mock data
        return NextResponse.json({ 
          error: 'No flashcards were generated. Please try again.',
          debug: {
            originalResponse: responseText ? responseText.substring(0, 500) : 'empty',
            parsedData: responseData ? JSON.stringify(responseData).substring(0, 500) : 'empty',
            reason: 'No cards were extracted from the AI response',
            knowledgeContext: knowledgeContext ? knowledgeContext.substring(0, 500) : 'none'
          }
        }, { status: 500 });
      }
      
      return NextResponse.json({ flashcards: flashcardSet });
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        
        // Return error with details
        console.error('Parse error and USE_MOCK_DATA is false, returning error to client');
        return NextResponse.json(
          { error: `Failed to parse AI response: ${parseError}` },
          { status: 500 }
        );
      }
    } catch (apiError) {
      console.error('API call error:', apiError);
      
      // Return error with details
      console.error('API call exception and USE_MOCK_DATA is false, returning error to client');
      return NextResponse.json(
        { error: `API call failed: ${apiError}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in flashcards API:', error);
    return NextResponse.json(
      { error: 'Failed to generate flashcards' },
      { status: 500 }
    );
  }
}

// Function to generate mock flashcards if the API call fails
function getMockFlashcards(topic: string, count: number = 5, isLearningGaps: boolean = false): FlashcardSet {
  // Choose the appropriate set of cards based on generation type
  let baseCards;
  
  if (isLearningGaps) {
    // Learning gaps focused cards
    baseCards = [
      {
        front: `Common misconception about ${topic}`,
        back: `Many students misunderstand ${topic} by thinking it's simply about memorization. In reality, it involves understanding key concepts and their relationships. Focus on building a mental model rather than just memorizing facts.`
      },
      {
        front: `Key challenge in understanding ${topic}`,
        back: `The most challenging aspect of ${topic} is connecting theoretical concepts to practical applications. Try to relate each concept to real-world examples to strengthen your understanding.`
      },
      {
        front: `Critical thinking strategy for ${topic}`,
        back: `When working with ${topic}, use the "compare and contrast" method to identify similarities and differences between related concepts. This helps build deeper conceptual understanding.`
      },
      {
        front: `Visualization technique for ${topic}`,
        back: `Create mental maps or diagrams connecting the main concepts in ${topic}. Visualization helps solidify understanding and reveals relationships between ideas that might not be obvious from text alone.`
      },
      {
        front: `Application exercises for ${topic}`,
        back: `Practice applying ${topic} concepts to novel situations. Start with simple examples and gradually increase complexity. This builds confidence and reveals any gaps in understanding.`
      },
      {
        front: `Clarifying ${topic} terminology`,
        back: `Technical terms in ${topic} often cause confusion. Create a personal glossary with clear definitions in your own words, and connect each term to the broader conceptual framework.`
      },
      {
        front: `Problem-solving approach for ${topic}`,
        back: `When facing problems related to ${topic}, use this structured approach: (1) Identify key concepts involved, (2) Connect to similar examples you've seen, (3) Break the problem into smaller parts, (4) Apply relevant principles to each part.`
      }
    ];
  } else {
    // General content cards
    baseCards = [
      {
        front: `Definition of ${topic}`,
        back: `${topic} refers to the core concepts and principles that define this field of study. It encompasses various theories, methodologies, and applications that students should understand.`
      },
      {
        front: `Key Principles of ${topic}`,
        back: `The key principles of ${topic} include systematic analysis, evidence-based reasoning, and application of theoretical frameworks to solve practical problems.`
      },
      {
        front: `History of ${topic}`,
        back: `The development of ${topic} can be traced through several historical periods, with significant contributions from various scholars and practitioners who shaped its modern understanding.`
      },
      {
        front: `Applications of ${topic}`,
        back: `${topic} has numerous real-world applications, including problem-solving, decision-making, and advancing knowledge in related fields. These applications demonstrate its practical importance.`
      },
      {
        front: `${topic} Methodology`,
        back: `The methodology of ${topic} involves systematic approaches to gathering, analyzing, and interpreting information to draw valid conclusions and make informed decisions.`
      },
      {
        front: `Challenges in ${topic}`,
        back: `Current challenges in ${topic} include adapting to technological changes, addressing ethical considerations, and integrating interdisciplinary perspectives for comprehensive understanding.`
      },
      {
        front: `Future of ${topic}`,
        back: `The future of ${topic} likely involves integration with emerging technologies, expansion into new domains, and addressing complex societal challenges through innovative approaches.`
      }
    ];
  }
  
  // Select the requested number of cards
  const selectedCards = baseCards.slice(0, Math.min(count, baseCards.length));
  
  // Format the cards with IDs
  const formattedCards = selectedCards.map((card, index) => ({
    id: `mock-${topic.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
    front: card.front,
    back: card.back
  }));

  // Create the flashcard set
  return {
    id: `mock-${topic.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    type: 'flashcards',
    title: `${topic} - Flashcards${isLearningGaps ? ' (Learning Gaps)' : ''}`,
    createdAt: new Date(),
    content: {
      cards: formattedCards
    }
  };
}