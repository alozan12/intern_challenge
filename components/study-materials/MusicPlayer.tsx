'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, X, Maximize2, Minimize2, Music, FileText } from 'lucide-react'
import { StudyMaterial } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface MusicPlayerProps {
  musicSet: StudyMaterial
  onClose?: () => void
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

type MusicGenreType = 'rap' | 'pop' | 'opera' | 'jazz' | 'rock' | 'retro'

interface Track {
  id: string
  title: string
  artist: string
  duration: number
  genre: string
  src: string
}

interface LyricsSection {
  name: string
  lyrics: string[]
}

interface LyricsResponse {
  title: string
  sections: LyricsSection[]
}

interface MusicGenreInfo {
  id: MusicGenreType
  name: string
  description: string
  emoji: string
}

// Mock genres - these would be used with Suno API
const mockGenres: MusicGenreInfo[] = [
  {
    id: 'rap',
    name: 'Rap',
    description: 'Energetic beats and rhythmic flow for motivation',
    emoji: '🎤'
  },
  {
    id: 'pop',
    name: 'Pop',
    description: 'Catchy melodies and upbeat rhythms for studying',
    emoji: '🎵'
  },
  {
    id: 'opera',
    name: 'Opera',
    description: 'Dramatic classical vocals and orchestration',
    emoji: '🎭'
  },
  {
    id: 'jazz',
    name: 'Jazz',
    description: 'Smooth improvisational music for concentration',
    emoji: '🎷'
  },
  {
    id: 'rock',
    name: 'Rock',
    description: 'Powerful guitar-driven music for focus',
    emoji: '🎸'
  },
  {
    id: 'retro',
    name: 'Retro',
    description: 'Nostalgic sounds from past decades for studying',
    emoji: '🕰️'
  }
]

// Mock track data - using the provided pythagorean.mp3 file
const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Study Flow Beats',
    artist: 'AI Generated',
    duration: 180,
    genre: 'rap',
    src: '/mock_assets/pythagorean.mp3'
  },
  {
    id: '2',
    title: 'Focus Pop Anthem',
    artist: 'Study Sounds',
    duration: 240,
    genre: 'pop',
    src: '/mock_assets/pythagorean.mp3'
  },
  {
    id: '3',
    title: 'Opera for the Mind',
    artist: 'Classical Composers',
    duration: 300,
    genre: 'opera',
    src: '/mock_assets/pythagorean.mp3'
  },
  {
    id: '4',
    title: 'Jazz Study Lounge',
    artist: 'Smooth Studies',
    duration: 210,
    genre: 'jazz',
    src: '/mock_assets/pythagorean.mp3'
  },
  {
    id: '5',
    title: 'Rock Your Studies',
    artist: 'Concentration Co.',
    duration: 200,
    genre: 'rock',
    src: '/mock_assets/pythagorean.mp3'
  },
  {
    id: '6',
    title: 'Retro Study Vibes',
    artist: 'Vintage Academy',
    duration: 220,
    genre: 'retro',
    src: '/mock_assets/pythagorean.mp3'
  }
]

export function MusicPlayer({ 
  musicSet, 
  onClose, 
  isFullscreen = false, 
  onToggleFullscreen 
}: MusicPlayerProps) {
  // Always use the genre from the musicSet
  const selectedGenre = (musicSet.content?.genre as MusicGenreType) || 'pop'
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isGenerating, setIsGenerating] = useState(true)
  const [lyrics, setLyrics] = useState<LyricsResponse | null>(null)
  const [showLyrics, setShowLyrics] = useState(true)
  
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime)
      const updateDuration = () => {
        console.log('Audio duration loaded:', audio.duration)
        setDuration(audio.duration)
      }
      const handleError = (e: Event) => {
        console.error('Audio error event:', e)
      }
      const handleCanPlay = () => {
        console.log('Audio can play')
        // Optionally auto-play when ready
        // audio.play().catch(e => console.error('Auto-play failed:', e))
      }
      
      audio.addEventListener('timeupdate', updateTime)
      audio.addEventListener('loadedmetadata', updateDuration)
      audio.addEventListener('error', handleError)
      audio.addEventListener('canplay', handleCanPlay)
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime)
        audio.removeEventListener('loadedmetadata', updateDuration)
        audio.removeEventListener('error', handleError)
        audio.removeEventListener('canplay', handleCanPlay)
      }
    }
  }, [currentTrack])

  // Update volume whenever it changes
  useEffect(() => {
    if (audioRef.current) {
      console.log('Setting volume to:', volume)
      audioRef.current.volume = volume
    }
  }, [volume])
  
  // Auto-play when the track is generated and ready
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      // Set up an event listener for when the audio is ready to play
      const handleCanPlay = () => {
        console.log('Audio can play automatically now')
        // Attempt to play automatically
        audioRef.current?.play().then(() => {
          setIsPlaying(true)
          console.log('Auto-play successful')
        }).catch(error => {
          console.log('Auto-play failed, user interaction required:', error)
          // Don't show an alert here as it's expected due to browser policies
          // that often prevent auto-play without user interaction
        })
      }
      
      // Add the event listener
      audioRef.current.addEventListener('canplay', handleCanPlay)
      
      // Clean up
      return () => {
        audioRef.current?.removeEventListener('canplay', handleCanPlay)
      }
    }
  }, [currentTrack])

  // No longer needed - genre comes from content creation

  // Auto-generate when component mounts
  useEffect(() => {
    const generateMusic = async () => {
      // Check if we have actual tracks from the API
      if (musicSet.content?.tracks && musicSet.content.tracks.length > 0) {
        // Use the first track from the generated content
        const track = musicSet.content.tracks[0] as Track
        console.log('Using generated track:', track.title, 'from:', track.src)
        setCurrentTrack(track)
        
        // Set lyrics if available
        if (musicSet.content?.lyrics) {
          console.log('Setting lyrics:', musicSet.content.lyrics)
          setLyrics(musicSet.content.lyrics as LyricsResponse)
        }
        
        setIsGenerating(false)
      } else {
        // Fallback to mock generation if no tracks
        console.log('No tracks in musicSet, using mock data')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const matchedTrack = mockTracks.find(track => track.genre === selectedGenre) || mockTracks[0]
        const audioPath = '/mock_assets/pythagorean.mp3'
        
        console.log('Using mock audio path:', audioPath)
        
        const generatedTrack: Track = {
          ...matchedTrack,
          title: `${mockGenres.find(g => g.id === selectedGenre)?.name || 'Study'} Session`,
          artist: 'AI Generated Music',
          src: audioPath
        }
        
        setCurrentTrack(generatedTrack)
        setIsGenerating(false)
      }
    }
    
    generateMusic()
  }, [selectedGenre, musicSet])

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        // Make sure to set volume before playing
        audioRef.current.volume = volume
        
        // Add a visible feedback while trying to play
        console.log('Attempting to play audio...')
        
        audioRef.current.play().then(() => {
          console.log('Audio playing successfully')
          setIsPlaying(true)
        }).catch(error => {
          console.error('Play failed:', error)
          // Handle autoplay policy restrictions
          alert('Failed to play audio. Please check your browser settings or try again.')
          setIsPlaying(false)
        })
      }
    } else {
      console.error('Audio element reference not available')
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (audio) {
      const newTime = parseFloat(e.target.value)
      console.log('Seeking to time:', newTime)
      
      // First check if the audio is ready to seek
      if (audio.readyState >= 2) { // HAVE_CURRENT_DATA or better
        try {
          // The currentTime property might fail if the audio is not fully loaded
          audio.currentTime = newTime
          setCurrentTime(newTime)
          console.log('Seek successful to:', newTime)
        } catch (error) {
          console.error('Error seeking audio:', error)
          // Revert to actual current time if seeking fails
          setCurrentTime(audio.currentTime)
        }
      } else {
        console.warn('Audio not ready for seeking yet, readyState:', audio.readyState)
        // Revert to actual current time
        setCurrentTime(audio.currentTime)
      }
    } else {
      console.error('Audio element reference not available for seeking')
    }
  }

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
    }
  }

  const handleSkipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration)
    }
  }

  const handleSkipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // No longer needed - genre selection happens in content creation

  // Loading screen while generating music
  if (isGenerating) {
    return (
      <div className={cn(
        "flex flex-col bg-white",
        isFullscreen ? "fixed inset-0 z-50 h-screen" : "h-full"
      )}>
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Study Music Generator</h2>
              <p className="text-sm text-gray-600">Generating your personalized study music</p>
            </div>
            <div className="flex items-center gap-2">
              {onToggleFullscreen && (
                <button
                  onClick={onToggleFullscreen}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading animation */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
              <div className="w-16 h-16 rounded-full border-4 border-purple-300 border-t-purple-600 animate-spin absolute"></div>
              <Music className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
              Creating Your {mockGenres.find(g => g.id === selectedGenre)?.name} Study Mix
            </h3>
            <p className="text-gray-600">Generating AI-powered music optimized for studying</p>
          </div>
        </div>
      </div>
    )
  }

  // Music Player Interface
  return (
    <div className={cn(
      "flex flex-col bg-white",
      isFullscreen ? "fixed inset-0 z-50 h-screen" : "h-full"
    )}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Study Music Player</h2>
            <p className="text-sm text-gray-600">
              Now playing • {selectedGenre?.charAt(0).toUpperCase() + selectedGenre?.slice(1)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Lyrics Section - Now at the top */}
      {lyrics && (
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lyrics</h3>
              <button
                onClick={() => setShowLyrics(!showLyrics)}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {showLyrics ? 'Hide' : 'Show'} Lyrics
              </button>
            </div>
            
            {showLyrics && (
              <div className="space-y-6">
                {lyrics.sections.map((section, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-medium text-purple-700 text-sm uppercase tracking-wide">
                      {section.name}
                    </h4>
                    <div className="space-y-1">
                      {section.lyrics.map((line, lineIndex) => (
                        <p key={lineIndex} className="text-gray-700 leading-relaxed">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Player Controls - Now at the bottom */}
      {currentTrack && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-8 mt-auto">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{currentTrack.title}</h3>
            <p className="text-gray-600 mb-4 text-sm">{currentTrack.artist}</p>
            
            {/* Audio Controls */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={handleSkipBackward}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
                title="Skip back 10 seconds"
              >
                <SkipBack className="w-5 h-5 text-gray-700" />
              </button>
              
              <button
                onClick={handlePlayPause}
                className="p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              
              <button
                onClick={handleSkipForward}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
                title="Skip forward 10 seconds"
              >
                <SkipForward className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                <span className="text-xs">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs">{formatTime(duration)}</span>
              </div>

              {/* Volume Control */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <Volume2 className="w-4 h-4 text-gray-600" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.src}
          preload="auto"
          controls={false} /* Hide native controls */
          loop={false}
          muted={volume === 0}
          onEnded={() => setIsPlaying(false)}
          onCanPlay={() => console.log('Audio ready to play:', currentTrack.src)}
          onLoadStart={() => console.log('Audio loading started for:', currentTrack.src)}
          onLoadedData={() => console.log('Audio data loaded for:', currentTrack.src)}
          onLoadedMetadata={(e) => console.log('Audio metadata loaded, duration:', e.currentTarget.duration, 'for:', currentTrack.src)}
          onError={(e) => {
            console.error('Audio error for src:', currentTrack.src)
            const audio = e.currentTarget as HTMLAudioElement
            console.error('Audio error code:', audio.error?.code)
            console.error('Audio error message:', audio.error?.message)
            console.error('Current audio src:', audio.src)
            console.error('Track object:', currentTrack)
          }}
        />
      )}
    </div>
  )
}