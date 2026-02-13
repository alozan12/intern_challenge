'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { StudyMaterial, MusicSet } from '@/types'
import { v4 as uuidv4 } from 'uuid'

interface StudyMaterialCreatorProps {
  onClose: () => void
  onCreateMaterial: (material: StudyMaterial) => void
  selectedContent: string[]
}

type MaterialType = 'flashcards' | 'quiz' | 'summary' | 'music'

interface MaterialOption {
  id: MaterialType
  name: string
  description: string
  icon: string
}

const materialOptions: MaterialOption[] = [
  {
    id: 'flashcards',
    name: 'Flashcards',
    description: 'Create a set of flashcards to help memorize key concepts',
    icon: '🗃️'
  },
  {
    id: 'quiz',
    name: 'Quiz',
    description: 'Generate multiple-choice questions to test your knowledge',
    icon: '❓'
  },
  {
    id: 'summary',
    name: 'Summary',
    description: 'Create a concise summary of the selected content',
    icon: '📝'
  },
  {
    id: 'music',
    name: 'Study Music',
    description: 'Generate educational music based on your study content',
    icon: '🎵'
  }
]

type MusicGenreType = 'rap' | 'pop' | 'opera' | 'jazz' | 'rock' | 'retro'

interface MusicGenreInfo {
  id: MusicGenreType
  name: string
  description: string
  emoji: string
}

const musicGenres: MusicGenreInfo[] = [
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

export function StudyMaterialCreator({
  onClose,
  onCreateMaterial,
  selectedContent
}: StudyMaterialCreatorProps) {
  const [step, setStep] = useState<'type' | 'settings'>('type')
  const [selectedType, setSelectedType] = useState<MaterialType | null>(null)
  const [title, setTitle] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState<MusicGenreType>('pop')

  const handleTypeSelect = (type: MaterialType) => {
    setSelectedType(type)
    setTitle(`${type.charAt(0).toUpperCase() + type.slice(1)} - ${new Date().toLocaleDateString()}`)
    setStep('settings')
  }

  const handleGenerate = async () => {
    if (!selectedType || !title) return
    
    setIsGenerating(true)
    
    try {
      // In a real implementation, this would call an API to generate the content
      // For now, we'll just simulate the generation with mock data
      
      let material: StudyMaterial;
      
      switch (selectedType) {
        case 'flashcards':
          material = {
            id: `flashcards-${Date.now()}`,
            type: 'flashcards',
            title,
            createdAt: new Date(),
            content: {
              cards: [
                {
                  id: uuidv4(),
                  front: 'What is the purpose of this application?',
                  back: 'To help students study more effectively with AI-generated materials.'
                },
                {
                  id: uuidv4(),
                  front: 'What types of study materials can be created?',
                  back: 'Flashcards, quizzes, summaries, and educational music.'
                }
              ]
            }
          };
          break;
          
        case 'quiz':
          material = {
            id: `quiz-${Date.now()}`,
            type: 'quiz',
            title,
            createdAt: new Date(),
            content: {
              questions: [
                {
                  id: uuidv4(),
                  question: 'What is the main benefit of spaced repetition?',
                  options: [
                    'It requires less overall study time',
                    'It improves long-term retention',
                    'It makes studying more enjoyable',
                    'It reduces the need for practice'
                  ],
                  correctAnswer: 1,
                  explanation: 'Spaced repetition improves long-term retention by spacing out review sessions over time.'
                },
                {
                  id: uuidv4(),
                  question: 'Which study technique is most effective for complex concepts?',
                  options: [
                    'Rereading notes repeatedly',
                    'Highlighting key passages',
                    'Active recall and practice testing',
                    'Cramming before exams'
                  ],
                  correctAnswer: 2,
                  explanation: 'Active recall and practice testing have been shown to be the most effective techniques for learning complex concepts.'
                }
              ]
            }
          };
          break;
          
        case 'summary':
          material = {
            id: `summary-${Date.now()}`,
            type: 'summary',
            title,
            createdAt: new Date(),
            content: {
              text: 'This is a summary of the selected content. In a real implementation, this would be generated by AI based on the content you selected. The summary would highlight key concepts and important information from your study materials.',
              keyPoints: [
                'Effective studying requires active engagement with the material',
                'Spaced repetition improves long-term memory retention',
                'Practice testing is one of the most effective study techniques',
                'Varied practice helps build deeper understanding'
              ]
            }
          };
          break;
          
        case 'music':
          // For music, we'll create an initial placeholder that will be filled by the API
          const musicSet: MusicSet = {
            id: `music-${Date.now()}`,
            type: 'music',
            title: `${title} - ${selectedGenre.charAt(0).toUpperCase() + selectedGenre.slice(1)}`,
            createdAt: new Date(),
            content: {
              genre: selectedGenre,
              tracks: [
                {
                  id: uuidv4(),
                  title: `Educational ${selectedGenre.charAt(0).toUpperCase() + selectedGenre.slice(1)} Mix`,
                  artist: 'AI Study Coach',
                  duration: 180, // 3 minutes
                  genre: selectedGenre,
                  src: '/mock_assets/pythagorean.mp3' // Placeholder until real API generates music
                }
              ]
            }
          };
          material = musicSet;
          break;
          
        default:
          throw new Error('Invalid material type');
      }
      
      // Pass the generated material to the parent component
      onCreateMaterial(material);
    } catch (error) {
      console.error('Error generating material:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Content selection warning
  const showContentWarning = selectedContent.length === 0;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-medium">
          {step === 'type' ? 'Create Study Material' : `Create ${selectedType?.charAt(0).toUpperCase()}${selectedType?.slice(1)}`}
        </h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {showContentWarning && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">
              <strong>Tip:</strong> Select content from the knowledge base to create more relevant study materials.
            </p>
          </div>
        )}

        {step === 'type' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materialOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleTypeSelect(option.id)}
                className="flex flex-col items-center text-center p-6 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-4xl mb-4">{option.icon}</div>
                <h3 className="text-lg font-medium mb-2">{option.name}</h3>
                <p className="text-gray-500 text-sm">{option.description}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter a title for this material"
              />
            </div>

            {selectedType === 'music' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Music Style
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {musicGenres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => setSelectedGenre(genre.id)}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedGenre === genre.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{genre.emoji}</div>
                      <div className="font-medium">{genre.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selected Content
              </label>
              <div className="p-3 bg-gray-50 border rounded-md max-h-40 overflow-y-auto">
                {selectedContent.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedContent.map((content, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {content.length > 100 ? `${content.slice(0, 100)}...` : content}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No content selected. Materials will be generated with general information.</p>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep('type')}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={!title || isGenerating}
                className={`px-6 py-2 rounded-md ${
                  !title || isGenerating
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isGenerating ? 'Generating...' : 'Generate Material'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}