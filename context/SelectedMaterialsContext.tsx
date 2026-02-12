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

  return (
    <SelectedMaterialsContext.Provider
      value={{
        selectedMaterials,
        updateSelectedMaterials,
        getSelectedMaterialsMetadata
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