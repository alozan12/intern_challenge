# ASU Study Coach: Music Feature

This feature adds AI-powered educational music generation to the ASU Study Coach application.

## Features

- Generate educational music in various genres using selected study content
- Uses CreateAI for lyrics generation
- Uses ElevenLabs API for music generation
- Play and control the music within the application
- View generated lyrics alongside the music

## Implementation Details

1. **Music Player Component**
   - Located in `components/study-materials/MusicPlayer.tsx`
   - Provides music playback controls and genre selection interface
   - Displays lyrics alongside the music player

2. **Music Generation API**
   - API endpoint at `app/api/study/music/route.ts`
   - Accepts selected content and music style preferences
   - Uses CreateAI to generate educational lyrics
   - Integrates with ElevenLabs API to create the music

3. **Environment Setup**
   - Requires ElevenLabs API key in .env file
   - Existing CreateAI configuration is used for lyrics generation

## How to Use

1. Select educational content from your course
2. Choose the "Music" study material option
3. Select a music style (rap, pop, jazz, etc.)
4. System will generate educational lyrics and music
5. Use the player controls to listen to your study music

## Environment Variables

```env
# Add to your .env file
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

## Technical Notes

- Generated audio files are stored in `/public/generated/`
- The MusicSet interface in types/index.ts was updated to include lyrics
- Mock data is provided for testing without API access