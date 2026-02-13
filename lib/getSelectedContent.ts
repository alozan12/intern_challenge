import { KnowledgeBaseItem } from '@/types'

/**
 * Extracts content from selected knowledge base items
 * @param selectedKnowledgeItems Array of selected knowledge base items
 * @returns Array of content strings from selected items
 */
export function getSelectedContent(selectedKnowledgeItems: KnowledgeBaseItem[]): string[] {
  return selectedKnowledgeItems
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