'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { KnowledgeBaseItem } from '@/types'

interface SelectedMaterialsContextType {
  selectedMaterials: KnowledgeBaseItem[]
  updateSelectedMaterials: (materials: KnowledgeBaseItem[]) => void
  getSelectedMaterialsMetadata: () => {
    material_ids: string[]
    course_ids: string[]
  }
  getSelectedMaterialTitles: () => string[]
  getSelectedMaterialFilenames: () => string[]
}

const SelectedMaterialsContext = createContext<SelectedMaterialsContextType | undefined>(undefined)

export function SelectedMaterialsProvider({ children }: { children: React.ReactNode }) {
  const [selectedMaterials, setSelectedMaterials] = useState<KnowledgeBaseItem[]>([])

  const updateSelectedMaterials = useCallback((materials: KnowledgeBaseItem[]) => {
    setSelectedMaterials(materials)
  }, [])

  const getSelectedMaterialsMetadata = useCallback(() => {
    const material_ids = selectedMaterials
      .filter(item => item.isSelected)
      .map(item => item.id)
    
    const course_ids = [...new Set(
      selectedMaterials
        .filter(item => item.isSelected)
        .map(item => item.courseId)
    )]

    return { material_ids, course_ids }
  }, [selectedMaterials])

  const getSelectedMaterialTitles = useCallback(() => {
    return selectedMaterials
      .filter(item => item.isSelected)
      .map(item => item.title)
  }, [selectedMaterials])

  const getSelectedMaterialFilenames = useCallback(() => {
    return selectedMaterials
      .filter(item => item.isSelected && item.filename)
      .map(item => item.filename!)
  }, [selectedMaterials])

  return (
    <SelectedMaterialsContext.Provider
      value={{
        selectedMaterials,
        updateSelectedMaterials,
        getSelectedMaterialsMetadata,
        getSelectedMaterialTitles,
        getSelectedMaterialFilenames
      }}
    >
      {children}
    </SelectedMaterialsContext.Provider>
  )
}

export function useSelectedMaterials() {
  const context = useContext(SelectedMaterialsContext)
  if (context === undefined) {
    throw new Error('useSelectedMaterials must be used within a SelectedMaterialsProvider')
  }
  return context
}