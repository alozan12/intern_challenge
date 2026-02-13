import { KnowledgeBaseItem } from '@/types'

// Simple state structure for selected knowledge items
export const emptyKnowledgeItems: KnowledgeBaseItem[] = []

// Helper functions for knowledge item operations
export function toggleItemSelection(
  items: KnowledgeBaseItem[], 
  itemId: string
): KnowledgeBaseItem[] {
  return items.map(item => 
    item.id === itemId 
      ? { ...item, isSelected: !item.isSelected }
      : item
  )
}

export function getSelectedItemCount(items: KnowledgeBaseItem[]): number {
  return items.filter(item => item.isSelected).length
}

export function getSelectedContent(items: KnowledgeBaseItem[]): string[] {
  return items
    .filter(item => item.isSelected)
    .map(item => {
      // Extract relevant content
      const titleContent = item.title || '';
      let mainContent = item.content || '';
      
      // Limit content length for API calls
      if (mainContent.length > 1000) {
        mainContent = mainContent.substring(0, 1000) + '...';
      }
      
      // Create a formatted content string
      return `${titleContent}: ${mainContent}`;
    });
}