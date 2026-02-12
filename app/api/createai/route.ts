import { NextResponse } from 'next/server'

// CreateAI API configuration from environment variables
const CREATEAI_API_URL = process.env.CREATE_AI_API_ENDPOINT || 'https://api-main-poc.aiml.asu.edu/query'
const CREATEAI_API_TOKEN = process.env.CREATE_AI_API_TOKEN || ''

// Hardcoded student ID for now
const STUDENT_ID = '987655'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query, material_ids, course_ids, session_id, source_names = [], override_params = {} } = body
    
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      )
    }
    
    // Build expr filter
    const filters: string[] = []
    
    // Add student_id filter
    filters.push(`student_id == '${STUDENT_ID}'`)
    
    // Add material_id filters
    if (material_ids && material_ids.length > 0) {
      const materialFilter = material_ids
        .map((id: string) => `material_id == '${id}'`)
        .join(' || ')
      filters.push(`(${materialFilter})`)
    }
    
    // Add course_id filters
    if (course_ids && course_ids.length > 0) {
      const courseFilter = course_ids
        .map((id: string) => `course_id == '${id}'`)
        .join(' || ')
      filters.push(`(${courseFilter})`)
    }
    
    // Add source_names filters (document title/name filters)
    if (source_names && source_names.length > 0) {
      // Convert source names to properly escaped string literals and handle partial matches with 'contains'
      const sourceNameFilter = source_names
        .map((name: string) => {
          // Escape any special characters and wrap in quotes
          const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          return `source_name CONTAINS '${escapedName}'`
        })
        .join(' || ')
      filters.push(`(${sourceNameFilter})`)
    }
    
    const expr = filters.join(' && ')
    
    // Log the metadata and expr filter
    console.log('\n=== CreateAI API Route - Metadata ===');
    console.log('Query:', query);
    console.log('Material IDs:', material_ids);
    console.log('Course IDs:', course_ids);
    console.log('Student ID:', STUDENT_ID);
    console.log('Session ID:', session_id || `study_session_${Date.now()}`)
    console.log('Source Names:', source_names)
    console.log('Override Params:', JSON.stringify(override_params));
    console.log('Generated expr filter:', expr);
    console.log('=====================================\n');
    
    // Build CreateAI payload
    const payload = {
      action: 'query',
      query: query,
      model_provider: override_params.model_provider || 'openai',
      model_name: override_params.model_name || 'gpt4',
      session_id: session_id || `study_session_${Date.now()}`,
      model_params: {
        temperature: override_params.temperature !== undefined ? override_params.temperature : 0.7,
        system_prompt: override_params.system_prompt || 'You are an AI Study Coach helping students prepare for their assignments. Use the provided course materials to give accurate, helpful responses. Be encouraging and supportive while maintaining academic rigor.',
        enable_search: true,
        search_params: {
          expr: expr,
          top_k: override_params.top_k || 5,
          reranker: override_params.reranker !== undefined ? override_params.reranker : true,
          retrieval_type: override_params.retrieval_type || 'chunk',
          output_fields: ['content', 'source_name', 'material_id', 'course_id'],
          prompt_mode: override_params.prompt_mode || 'restricted',
          // Add filters for specific source names if provided
          source_filters: source_names && source_names.length > 0 ? { source_names } : undefined
        },
        enable_history: override_params.enable_history !== undefined ? override_params.enable_history : true,
        response_format: { type: 'text' },
        enhance_prompt: {
          timezone: 'MST',
          time: true,
          date: true,
          verbosity: override_params.verbosity || 'detailed'
        }
      }
    }
    
    if (!CREATEAI_API_TOKEN) {
      console.warn('No CreateAI API token configured, using mock response')
      
      // Mock response for development
      const contextInfo = material_ids?.length > 0 
        ? `I'm referencing ${material_ids.length} selected materials from your course.` 
        : 'I don\'t have any specific materials selected.'
        
      return NextResponse.json({
        success: true,
        response: `[Mock Response] ${contextInfo} You asked: "${query}". 
        
Based on the course materials, here's what I would help you with:
1. Key concepts related to your question
2. Examples from the selected materials
3. Practice problems to reinforce understanding

Remember, this is a mock response. In production, I would provide specific answers based on your selected course materials.`
      })
    }
    
    console.log('Sending request to CreateAI:', CREATEAI_API_URL)
    console.log('Payload:', JSON.stringify(payload, null, 2))
    
    const response = await fetch(CREATEAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CREATEAI_API_TOKEN}`
      },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('CreateAI API error:', response.status, errorText)
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('CreateAI response:', data)
    
    return NextResponse.json({
      success: true,
      response: data.response || data.message || 'No response from AI'
    })
    
  } catch (error) {
    console.error('Error in CreateAI route:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to query AI'
      },
      { status: 500 }
    )
  }
}