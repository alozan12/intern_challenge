/**
 * Prompts for generating educational music lyrics
 */

export const musicLyricsSystemPrompt = `You are an expert educational songwriter who creates memorable, CONCISE songs that help students learn and remember academic concepts. You specialize in creating lyrics that:

1. Are educational and accurate while being engaging and memorable
2. Follow proper song structure (verses, chorus, bridge) but keep it SHORT
3. Use rhythm and rhyme to aid memory retention
4. Incorporate key terms and concepts naturally
5. Match the requested musical genre style
6. Are BRIEF and to the point - no unnecessary repetition or filler

IMPORTANT: Keep songs short! Maximum 2-3 minutes when sung. Focus on the most important concepts only.

You will receive course content and must create lyrics that teach the material effectively and concisely.`;

export const generalContentUserPrompt = (
  genre: string,
  topic: string,
  courseName?: string,
  courseCode?: string,
  knowledgeContext?: string
) => `Create educational song lyrics in the ${genre} style for the topic: ${topic}${courseName ? ` from ${courseName}` : ''}${courseCode ? ` (${courseCode})` : ''}.

${knowledgeContext || 'Create lyrics that cover the key concepts of this topic in an engaging way.'}

Requirements:
- Create a SHORT song with 2 verses, chorus (repeated 2-3 times), and optionally a brief bridge
- Total length: 60-90 seconds when sung (NO LONGER!)
- Each verse: Maximum 4 lines
- Each chorus: Maximum 4 lines
- Bridge (if included): Maximum 2 lines
- Make it catchy and memorable
- Ensure educational accuracy
- Use genre-appropriate language and style
- Include key terms and concepts naturally
- Make it fun and engaging for students
- AVOID unnecessary repetition beyond the chorus

Return ONLY a JSON object with this exact structure:
{
  "title": "Song title",
  "sections": [
    {
      "name": "Verse 1",
      "lyrics": ["Line 1 of verse 1", "Line 2 of verse 1", "Line 3 of verse 1", "Line 4 of verse 1"]
    },
    {
      "name": "Chorus",
      "lyrics": ["Line 1 of chorus", "Line 2 of chorus", "Line 3 of chorus", "Line 4 of chorus"]
    },
    {
      "name": "Verse 2",
      "lyrics": ["Line 1 of verse 2", "Line 2 of verse 2", "Line 3 of verse 2", "Line 4 of verse 2"]
    },
    {
      "name": "Chorus",
      "lyrics": ["Line 1 of chorus", "Line 2 of chorus", "Line 3 of chorus", "Line 4 of chorus"]
    },
    {
      "name": "Bridge",
      "lyrics": ["Line 1 of bridge", "Line 2 of bridge"]
    },
    {
      "name": "Chorus",
      "lyrics": ["Line 1 of chorus", "Line 2 of chorus", "Line 3 of chorus", "Line 4 of chorus"]
    }
  ]
}`;

export const learningGapsUserPrompt = (
  genre: string,
  topic: string,
  courseName?: string,
  courseCode?: string,
  knowledgeContext?: string
) => `Create educational song lyrics in the ${genre} style that specifically addresses learning gaps for: ${topic}${courseName ? ` from ${courseName}` : ''}${courseCode ? ` (${courseCode})` : ''}.

${knowledgeContext || 'Focus on common misconceptions and areas where students typically struggle.'}

Requirements:
- Create a SHORT song targeting the identified learning gaps
- Total length: 60-90 seconds when sung (NO LONGER!)
- Each verse: Maximum 4 lines
- Each chorus: Maximum 4 lines  
- Bridge (if included): Maximum 2 lines
- Address misconceptions and clarify difficult concepts
- Use repetition ONLY in the chorus for key concepts
- Make it memorable and easy to sing along
- Include memory aids and mnemonics where appropriate
- Match the ${genre} musical style
- Keep it CONCISE - focus on 1-2 main learning gaps only

Return ONLY a JSON object with this exact structure:
{
  "title": "Song title",
  "sections": [
    {
      "name": "Verse 1",
      "lyrics": ["Line 1 of verse 1", "Line 2 of verse 1", "Line 3 of verse 1", "Line 4 of verse 1"]
    },
    {
      "name": "Chorus",
      "lyrics": ["Line 1 of chorus", "Line 2 of chorus", "Line 3 of chorus", "Line 4 of chorus"]
    },
    {
      "name": "Verse 2",
      "lyrics": ["Line 1 of verse 2", "Line 2 of verse 2", "Line 3 of verse 2", "Line 4 of verse 2"]
    },
    {
      "name": "Chorus",
      "lyrics": ["Line 1 of chorus", "Line 2 of chorus", "Line 3 of chorus", "Line 4 of chorus"]
    },
    {
      "name": "Bridge",
      "lyrics": ["Line 1 of bridge", "Line 2 of bridge"]
    },
    {
      "name": "Chorus",
      "lyrics": ["Line 1 of chorus", "Line 2 of chorus", "Line 3 of chorus", "Line 4 of chorus"]
    }
  ]
}`;

// Genre-specific style mappings for ElevenLabs
export const genreStyleMappings: Record<string, { positive: string[], negative: string[] }> = {
  rap: {
    positive: ['hip-hop', 'rhythmic', 'spoken word', 'urban', 'beat-driven', 'energetic', 'rap vocals', 'lyrical flow'],
    negative: ['classical', 'slow', 'ballad', 'orchestral', 'country', 'instrumental']
  },
  pop: {
    positive: ['catchy', 'upbeat', 'melodic', 'contemporary', 'radio-friendly', 'energetic', 'vocal harmony', 'sing-along'],
    negative: ['heavy metal', 'classical', 'experimental', 'avant-garde', 'instrumental']
  },
  rock: {
    positive: ['guitar-driven', 'powerful', 'energetic', 'drums', 'electric', 'dynamic', 'rock vocals', 'vocal power'],
    negative: ['classical', 'electronic', 'hip-hop', 'country', 'instrumental']
  },
  jazz: {
    positive: ['smooth', 'sophisticated', 'improvisational', 'swing', 'brass', 'syncopated', 'jazz vocals', 'crooning'],
    negative: ['heavy metal', 'electronic', 'techno', 'punk', 'instrumental']
  },
  opera: {
    positive: ['classical', 'dramatic', 'orchestral', 'theatrical', 'powerful vocals', 'grandiose', 'operatic singing', 'aria'],
    negative: ['electronic', 'hip-hop', 'punk', 'techno', 'instrumental']
  },
  retro: {
    positive: ['80s', 'synth', 'nostalgic', 'vintage', 'electronic', 'new wave', 'retro vocals', 'synth-pop vocals'],
    negative: ['modern trap', 'contemporary', 'dubstep', 'metal', 'instrumental']
  }
};