'use client'

import { useState } from 'react'
import { FlashcardSet, QuizSet, StudyMaterial, Summary, MusicSet } from '@/types'
import { FlashcardViewer } from './FlashcardViewer'
import { QuizViewer } from './QuizViewer'
import { SummaryViewer } from './SummaryViewer'
import { MusicPlayer } from './MusicPlayer'
import { Empty } from '@/components/Empty'

interface StudyMaterialsProps {
  materials: StudyMaterial[]
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  onClose?: () => void
  onGenerate?: (genre: string, selectedContent?: string[]) => Promise<void>
  selectedContent?: string[]
  generationType?: 'learning_gaps' | 'selected_content'
}

export function StudyMaterials({
  materials,
  isFullscreen = false,
  onToggleFullscreen,
  onClose,
  onGenerate,
  selectedContent,
  generationType = 'selected_content'
}: StudyMaterialsProps) {
  const [activeMaterial, setActiveMaterial] = useState<StudyMaterial | null>(
    materials.length > 0 ? materials[0] : null
  )

  if (!activeMaterial) {
    return <Empty message="No study materials have been created yet" />
  }

  const renderMaterial = () => {
    switch (activeMaterial.type) {
      case 'flashcards':
        return (
          <FlashcardViewer
            flashcardSet={activeMaterial as FlashcardSet}
            onClose={onClose}
            isFullscreen={isFullscreen}
            onToggleFullscreen={onToggleFullscreen}
          />
        )
      case 'quiz':
        return (
          <QuizViewer
            quizSet={activeMaterial as QuizSet}
            onClose={onClose}
            isFullscreen={isFullscreen}
            onToggleFullscreen={onToggleFullscreen}
          />
        )
      case 'summary':
        return (
          <SummaryViewer
            summary={activeMaterial as Summary}
            onClose={onClose}
            isFullscreen={isFullscreen}
            onToggleFullscreen={onToggleFullscreen}
          />
        )
      case 'music':
        return (
          <MusicPlayer
            musicSet={activeMaterial as MusicSet}
            onClose={onClose}
            isFullscreen={isFullscreen}
            onToggleFullscreen={onToggleFullscreen}
            onGenerate={onGenerate}
            selectedContent={selectedContent}
            generationType={generationType}
          />
        )
      default:
        return (
          <div className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">
              Unknown material type: {activeMaterial.type}
            </h3>
            <p className="text-gray-500">
              This material type is not supported in the current version.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* If not fullscreen, show the material selector */}
      {!isFullscreen && (
        <div className="flex border-b overflow-x-auto">
          {materials.map((material) => (
            <button
              key={material.id}
              onClick={() => setActiveMaterial(material)}
              className={`px-4 py-2 border-r whitespace-nowrap ${
                activeMaterial?.id === material.id
                  ? 'bg-purple-100 text-purple-800 border-b-2 border-b-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {material.title}
            </button>
          ))}
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-auto">{renderMaterial()}</div>
    </div>
  )
}