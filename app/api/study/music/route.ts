import { NextRequest, NextResponse } from 'next/server';
import { queryCreateAI } from '@/lib/createAI';
import { MusicSet } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';
import { music } from '@/prompts';

// Define interfaces for music generation request
interface MusicRequest {
  topic: string;
  courseId?: string;
  courseName?: string;
  courseCode?: string;
  genre: 'rap' | 'pop' | 'rock' | 'jazz' | 'opera' | 'retro';
  generationType?: 'learning_gaps' | 'selected_content';
  studentId?: string;
  selectedContent?: string[];
}

interface LyricsSection {
  name: string;
  lyrics: string[];
}

interface LyricsResponse {
  title: string;
  sections: LyricsSection[];
}

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

// Generate music using ElevenLabs API
async function generateMusicWithElevenLabs(lyrics: LyricsResponse, genre: string): Promise<{ audioUrl: string, songId: string }> {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  // Get genre-specific styles
  const genreStyles = music.genreStyleMappings[genre] || music.genreStyleMappings['pop'];
  
  // Convert lyrics to ElevenLabs format
  const sections = lyrics.sections.map((section, index) => {
    // Calculate duration based on number of lines (roughly 3 seconds per line for brevity)
    // Enforce maximum durations to keep songs short
    let durationMs = section.lyrics.length * 3000;
    
    // Set maximum durations based on section type
    if (section.name.toLowerCase().includes('verse')) {
      durationMs = Math.min(durationMs, 12000); // Max 12 seconds for verses
    } else if (section.name.toLowerCase().includes('chorus')) {
      durationMs = Math.min(durationMs, 12000); // Max 12 seconds for chorus
    } else if (section.name.toLowerCase().includes('bridge')) {
      durationMs = Math.min(durationMs, 8000); // Max 8 seconds for bridge
    }
    
    // Ensure minimum duration
    durationMs = Math.max(durationMs, 5000); // Min 5 seconds
    
    return {
      section_name: section.name,
      positive_local_styles: [...genreStyles.positive],
      negative_local_styles: [...genreStyles.negative],
      duration_ms: durationMs,
      lines: section.lyrics
    };
  });

  // Create composition plan with enhanced parameters to ensure both vocals and music
  const compositionPlan = {
    positive_global_styles: [
      ...genreStyles.positive,
      'educational',
      'memorable',
      'clear vocals',
      'vocal-centric',
      'singing',
      'lyrical',
      'engaging',
      'with vocals',
      'vocals with instrumental accompaniment',
      'full production',
      'balanced mix',
      'vocals and music',
      'complete song',
      'full band',
      'full instrumentation',
      'vocals over instrumental'
    ],
    negative_global_styles: [
      ...genreStyles.negative,
      'instrumental only',
      'no vocals',
      'instrumental',
      'karaoke',
      'backing track',
      'ambient',
      'no singing',
      'voiceless',
      'acapella',
      'vocals only',
      'no background music',
      'no instruments',
      'sparse',
      'minimal'
    ],
    sections: sections
  };

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/music', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        composition_plan: compositionPlan,
        model_id: 'music_v1',
        force_instrumental: false,
        vocals_only: false, // Explicitly set to false to ensure we get both vocals AND music
        include_instrumental: true, // Ensure we get instrumental tracks with the vocals
        respect_sections_durations: false,
        output_format: 'mp3_44100_128'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Get song ID from response headers
    const songId = response.headers.get('x-song-id') || `song_${Date.now()}`;
    
    // Get the audio data
    const audioBuffer = await response.arrayBuffer();
    
    // Create directory for storing music files
    const musicDir = path.join(process.cwd(), 'public', 'generated-music');
    await fs.mkdir(musicDir, { recursive: true });
    
    // Save the audio file
    const filename = `${genre}_${lyrics.title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.mp3`;
    const filePath = path.join(musicDir, filename);
    await fs.writeFile(filePath, Buffer.from(audioBuffer));
    
    // Return the public URL
    const audioUrl = `/generated-music/${filename}`;
    
    return { audioUrl, songId };
  } catch (error) {
    console.error('Error generating music with ElevenLabs:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { 
      topic, 
      courseId, 
      courseName,
      courseCode,
      genre,
      generationType = 'selected_content',
      studentId,
      selectedContent = []
    }: MusicRequest = await req.json();
    
    if (!topic || !genre) {
      return NextResponse.json(
        { error: 'Topic and genre are required' },
        { status: 400 }
      );
    }
    
    console.log('Generating music for:', { topic, genre, generationType });
    
    // Step 1: Load knowledge base and prepare context
    const courseItems = await loadKnowledgeBase(courseId, studentId);
    console.log('Loaded course items:', courseItems.length);
    
    let knowledgeContext = '';
    
    if (generationType === 'learning_gaps') {
      const learningGaps = extractLearningGaps(courseItems);
      console.log('Found learning gaps:', learningGaps.length);
      
      if (learningGaps.length > 0) {
        knowledgeContext = `\n\nBased on the student's past performance, they have struggled with the following concepts:\n${learningGaps.map(gap => 
          `- ${gap.topic}: Student answered "${gap.studentAnswer}" but correct answer is "${gap.correctAnswer}" (from ${gap.itemTitle})`
        ).join('\n')}\n\nFocus your song lyrics on these specific areas where the student needs improvement.`;
      }
    } else if (generationType === 'selected_content' && selectedContent && selectedContent.length > 0) {
      console.log('Using selected content:', selectedContent.length);
      
      knowledgeContext = `\n\nFocus on the following selected content:\n${selectedContent.map(content => `- ${content}`).join('\n')}\n\nCreate song lyrics that specifically cover this selected content.`;
    } else {
      const generalTopics = extractGeneralTopics(courseItems);
      console.log('Found general topics:', generalTopics.length);
      
      if (generalTopics.length > 0) {
        knowledgeContext = `\n\nThe course covers the following topics based on past assessments:\n${generalTopics.slice(0, 10).map(topic => `- ${topic}`).join('\n')}\n\nCreate song lyrics that cover these course topics in an engaging way.`;
      }
    }
    
    // Step 2: Generate lyrics using CreateAI
    const systemPrompt = music.musicLyricsSystemPrompt;
    const userPrompt = generationType === 'learning_gaps'
      ? music.learningGapsUserPrompt(genre, topic, courseName, courseCode, knowledgeContext)
      : music.generalContentUserPrompt(genre, topic, courseName, courseCode, knowledgeContext);
    
    const options = {
      modelProvider: 'gcp-deepmind',
      modelName: 'geminiflash3',
      sessionId: `music_lyrics_${Date.now()}`,
      systemPrompt,
      temperature: 0.8, // Higher temperature for creative lyrics
      context: {
        topic,
        courseId,
        courseName,
        courseCode,
        genre,
        generationType,
        studentId,
        knowledgeBase: knowledgeContext,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('Calling CreateAI for lyrics generation');
    const lyricsResponse = await queryCreateAI<{ response: string }>(userPrompt, options);
    
    if (!lyricsResponse.data || lyricsResponse.error) {
      console.error('Error generating lyrics:', lyricsResponse.error);
      return NextResponse.json(
        { error: `Failed to generate lyrics: ${lyricsResponse.error}` },
        { status: 500 }
      );
    }
    
    // Parse the lyrics response
    let lyrics: LyricsResponse;
    try {
      let responseText = '';
      if (lyricsResponse.data?.response) {
        responseText = lyricsResponse.data.response;
      } else if (lyricsResponse.data) {
        responseText = typeof lyricsResponse.data === 'string' ? lyricsResponse.data : JSON.stringify(lyricsResponse.data);
      }
      
      console.log('Raw lyrics response (first 500 chars):', responseText.substring(0, 500));
      
      // Try to parse as JSON
      try {
        lyrics = JSON.parse(responseText);
      } catch (e) {
        // Extract from code blocks if needed
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          lyrics = JSON.parse(jsonMatch[1]);
        } else {
          // Try to extract JSON from text
          const jsonStart = responseText.indexOf('{');
          const jsonEnd = responseText.lastIndexOf('}');
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            lyrics = JSON.parse(responseText.substring(jsonStart, jsonEnd + 1));
          } else {
            throw new Error('Could not find valid JSON in lyrics response');
          }
        }
      }
      
      if (!lyrics.title || !lyrics.sections || !Array.isArray(lyrics.sections)) {
        throw new Error('Invalid lyrics format');
      }
      
    } catch (parseError) {
      console.error('Error parsing lyrics:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse lyrics data' },
        { status: 500 }
      );
    }
    
    console.log('Generated lyrics:', lyrics.title, 'with', lyrics.sections.length, 'sections');
    
    // Step 3: Generate music with ElevenLabs
    let audioUrl: string;
    let songId: string;
    
    try {
      const result = await generateMusicWithElevenLabs(lyrics, genre);
      audioUrl = result.audioUrl;
      songId = result.songId;
      console.log('Generated music successfully:', audioUrl);
    } catch (elevenlabsError) {
      console.error('ElevenLabs generation failed:', elevenlabsError);
      console.error('Error details:', {
        hasApiKey: !!process.env.ELEVEN_LABS_API_KEY,
        apiKeyLength: process.env.ELEVEN_LABS_API_KEY?.length || 0,
        errorMessage: elevenlabsError instanceof Error ? elevenlabsError.message : String(elevenlabsError),
        lyrics: lyrics
      });
      // Fallback to mock audio file
      audioUrl = '/mock_assets/pythagorean.mp3';
      songId = 'mock_' + Date.now();
      console.log('Using fallback audio file');
    }
    
    // Create the music set response
    const musicSet: MusicSet = {
      id: `music-${topic.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      type: 'music',
      title: `${lyrics.title} (${genre.charAt(0).toUpperCase() + genre.slice(1)})`,
      createdAt: new Date(),
      content: {
        genre: genre,
        lyrics: lyrics, // Include the lyrics in the content
        tracks: [
          {
            id: songId,
            title: lyrics.title,
            artist: 'AI Study Coach',
            duration: 90, // Approximate duration
            genre: genre,
            src: audioUrl
          }
        ]
      }
    };
    
    return NextResponse.json({ 
      music: musicSet, 
      lyrics,
      debug: {
        usedMockAudio: audioUrl.includes('mock'),
        hasElevenLabsKey: !!process.env.ELEVEN_LABS_API_KEY,
        lyricsGenerated: !!lyrics.sections && lyrics.sections.length > 0
      }
    });
    
  } catch (error) {
    console.error('Error in music generation API:', error);
    return NextResponse.json(
      { error: 'Failed to generate music' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if music generation is available
export async function GET(req: NextRequest) {
  const hasElevenLabsKey = !!process.env.ELEVEN_LABS_API_KEY;
  
  return NextResponse.json({
    available: true,
    elevenLabsConfigured: hasElevenLabsKey,
    supportedGenres: ['rap', 'pop', 'rock', 'jazz', 'opera', 'retro']
  });
}