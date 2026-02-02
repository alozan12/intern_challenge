'use client'

import { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

type TabsContextValue = {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue>({
  value: '',
  onValueChange: () => {}
})

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

export function Tabs({ 
  defaultValue, 
  value, 
  onValueChange, 
  className, 
  children 
}: TabsProps) {
  const [tabValue, setTabValue] = useState(defaultValue || '')
  
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : tabValue
  
  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setTabValue(newValue)
    }
    onValueChange?.(newValue)
  }
  
  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  className?: string
  children: React.ReactNode
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div className={cn("flex items-center", className)}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  className?: string
  children: React.ReactNode
  disabled?: boolean
}

export function TabsTrigger({ value, className, children, disabled }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useContext(TabsContext)
  const isSelected = selectedValue === value
  
  return (
    <button
      className={cn(
        "flex items-center justify-center text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={() => onValueChange(value)}
      data-state={isSelected ? "active" : "inactive"}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  className?: string
  children: React.ReactNode
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const { value: selectedValue } = useContext(TabsContext)
  const isSelected = selectedValue === value
  
  if (!isSelected) return null
  
  return (
    <div
      className={cn(className)}
      data-state={isSelected ? "active" : "inactive"}
    >
      {children}
    </div>
  )
}