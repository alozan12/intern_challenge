// Centralized service for managing AI insights across the application
import { AIInsight } from '@/types'

const INSIGHTS_STORAGE_KEY = 'aiGeneratedInsights'
const INSIGHTS_CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

interface InsightsCache {
  insights: AIInsight[]
  timestamp: number
  studentId: string
}

export class InsightsService {
  private static instance: InsightsService
  private cache: InsightsCache | null = null
  
  private constructor() {}
  
  static getInstance(): InsightsService {
    if (!InsightsService.instance) {
      InsightsService.instance = new InsightsService()
    }
    return InsightsService.instance
  }
  
  // Load insights from localStorage
  private loadFromStorage(): InsightsCache | null {
    try {
      const stored = localStorage.getItem(INSIGHTS_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading insights from storage:', error)
    }
    return null
  }
  
  // Save insights to localStorage
  private saveToStorage(cache: InsightsCache): void {
    try {
      localStorage.setItem(INSIGHTS_STORAGE_KEY, JSON.stringify(cache))
    } catch (error) {
      console.error('Error saving insights to storage:', error)
    }
  }
  
  // Check if cache is still valid
  private isCacheValid(cache: InsightsCache | null, studentId: string): boolean {
    if (!cache) return false
    if (cache.studentId !== studentId) return false
    
    const now = Date.now()
    return (now - cache.timestamp) < INSIGHTS_CACHE_DURATION
  }
  
  // Fetch insights from API
  private async fetchInsightsFromAPI(studentId: string, count?: number): Promise<AIInsight[]> {
    try {
      // Limit count to maximum of 5
      const limitedCount = count ? Math.min(5, Math.max(1, count)) : undefined
      
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId,
          insightType: 'recommendation',
          count: limitedCount // Pass the limited count to the API
        })
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Map the recommendations to our AIInsight format
      if (data.type === 'recommendation' && Array.isArray(data.data?.recommendations)) {
        return data.data.recommendations.map((rec: any, index: number) => {
          // Use course info provided by AI if available
          let courseId = rec.courseId || 'unknown'
          let courseName = rec.courseName || 'General Course'
          let courseCode = rec.courseCode || 'CSE 101'
          
          // Fallback to determining from topics if not provided
          if (!rec.courseId && rec.topics && rec.topics.length > 0) {
            const topic = rec.topics[0].toLowerCase()
            
            if (topic.includes('tree') || topic.includes('bst') || topic.includes('array') || 
                topic.includes('linked list') || topic.includes('graph')) {
              courseId = '112233'
              courseName = 'Data Structures & Algorithms'
              courseCode = 'CSE310'
            }
            else if (topic.includes('programming') || topic.includes('functional') || 
                     topic.includes('procedural') || topic.includes('oop')) {
              courseId = '112234'
              courseName = 'Principles of Programming Languages'
              courseCode = 'CSE340'
            }
            else if (topic.includes('math') || topic.includes('discrete')) {
              courseId = '112235'
              courseName = 'Discrete Mathematical Structures'
              courseCode = 'MAT243'
            }
          }
          
          // Map deadline if provided
          let deadline = undefined
          if (rec.deadline) {
            deadline = {
              id: rec.deadline.id || `deadline_${index}`,
              title: rec.deadline.title,
              dueDate: new Date(rec.deadline.dueDate),
              type: rec.deadline.type || 'assignment'
            }
          }
          
          return {
            id: `insight_${Date.now()}_${index}`,
            title: rec.title,
            description: rec.description,
            duration: rec.duration,
            type: rec.type === 'quick' ? 'review' : 'practice',
            courseId: courseId,
            courseName: courseName,
            courseCode: courseCode,
            topic: rec.topics[0] || 'General',
            priority: rec.priority || 'medium',
            createdAt: new Date().toISOString(),
            deadline: deadline
          } as AIInsight
        })
      }
      
      throw new Error('Invalid API response format')
    } catch (error) {
      console.error('Error fetching insights from API:', error)
      throw error
    }
  }
  
  // Get insights (from cache or API)
  async getInsights(studentId: string, forceRefresh = false, count?: number): Promise<AIInsight[]> {
    // If a specific count is requested, always fetch fresh data
    if (count) {
      forceRefresh = true
    }
    
    // Check cache first (only if not forcing refresh)
    if (!forceRefresh) {
      const storedCache = this.loadFromStorage()
      if (this.isCacheValid(storedCache, studentId)) {
        this.cache = storedCache
        return storedCache!.insights
      }
    }
    
    // Fetch new insights
    try {
      const insights = await this.fetchInsightsFromAPI(studentId, count)
      
      // Update cache
      this.cache = {
        insights,
        timestamp: Date.now(),
        studentId
      }
      
      // Save to storage
      this.saveToStorage(this.cache)
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('insightsUpdated', { 
        detail: { insights, studentId } 
      }))
      
      return insights
    } catch (error) {
      console.error('Failed to fetch insights:', error)
      
      // Return cached insights if available, even if expired
      const storedCache = this.loadFromStorage()
      if (storedCache && storedCache.studentId === studentId) {
        return storedCache.insights
      }
      
      // Return empty array as last resort
      return []
    }
  }
  
  // Get limited insights for preview (e.g., landing page)
  async getPreviewInsights(studentId: string, limit = 3): Promise<AIInsight[]> {
    const allInsights = await this.getInsights(studentId)
    
    // Sort by priority and return top N
    return allInsights
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        const aPriority = priorityOrder[a.priority || 'medium']
        const bPriority = priorityOrder[b.priority || 'medium']
        return aPriority - bPriority
      })
      .slice(0, limit)
  }
  
  // Clear cache (useful for logout or manual refresh)
  clearCache(): void {
    this.cache = null
    localStorage.removeItem(INSIGHTS_STORAGE_KEY)
  }
  
  // Subscribe to insights updates
  subscribeToUpdates(callback: (insights: AIInsight[]) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail?.insights) {
        callback(customEvent.detail.insights)
      }
    }
    
    window.addEventListener('insightsUpdated', handler)
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener('insightsUpdated', handler)
    }
  }
}