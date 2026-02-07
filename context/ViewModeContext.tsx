'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type ViewModeType = 'compact' | 'expanded'

interface ViewModeContextType {
  viewMode: ViewModeType
  setViewMode: (mode: ViewModeType) => void
  cardListViewMode: 'card' | 'list'
  setCardListViewMode: (mode: 'card' | 'list') => void
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined)

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewModeType>('expanded')
  const [cardListViewMode, setCardListViewMode] = useState<'card' | 'list'>('card')

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode, cardListViewMode, setCardListViewMode }}>
      {children}
    </ViewModeContext.Provider>
  )
}

export function useViewMode() {
  const context = useContext(ViewModeContext)
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider')
  }
  return context
}