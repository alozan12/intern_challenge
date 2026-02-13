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
    
    // Build expr filter - focusing on material filtering without student_id
    const filters: string[] = []
    
    // Only add material_id filters when specified
    if (material_ids && material_ids.length > 0) {
      const materialFilter = material_ids
        .map((id: string) => `material_id == '${id}'`)
        .join(' || ')
      filters.push(`(${materialFilter})`)
    }
    
    // Add course_id filters if needed
    if (course_ids && course_ids.length > 0) {
      const courseFilter = course_ids
        .map((id: string) => `course_id == '${id}'`)
        .join(' || ')
      filters.push(`(${courseFilter})`)
    }
    
    // Build expr only if we have filters
    const expr = filters.length > 0 ? filters.join(' && ') : undefined
    
    // Log the metadata and expr filter
    console.log('\n=== CreateAI API Route - Metadata ===');
    console.log('Query:', query);
    console.log('Material IDs:', material_ids);
    console.log('Course IDs:', course_ids);
    console.log('Session ID:', session_id || `study_session_${Date.now()}`)
    console.log('Source Names:', source_names)
    console.log('Override Params:', JSON.stringify(override_params));
    console.log('Generated expr filter:', expr || 'No expr filter');
    console.log('=====================================\n');
    
    // Build CreateAI payload with override_params approach
    const payload = {
      action: 'query',
      query: query,
      model_provider: override_params.model_provider || 'openai',
      model_name: override_params.model_name || 'gpt4',
      session_id: session_id || `study_session_${Date.now()}`,
      // Add request_source to use override_params
      request_source: 'override_params',
      model_params: {
        temperature: override_params.temperature !== undefined ? override_params.temperature : 0.7,
        system_prompt: override_params.system_prompt || 
          (source_names && source_names.length > 0 
            ? `CRITICAL INSTRUCTION: You are an AI Study Coach with access to ONLY the following document(s): ${source_names.join(', ')}.

STRICT RULES:
1. You MUST ONLY use information from ${source_names.length === 1 ? 'this specific document' : 'these specific documents'}: ${source_names.join(', ')}
2. If asked about content not in ${source_names.length === 1 ? 'this document' : 'these documents'}, you MUST respond: "I can only provide information from ${source_names.join(' and ')}. That topic is not covered in ${source_names.length === 1 ? 'this document' : 'these documents'}."
3. DO NOT reference or use information from any other documents, especially not from "1-database_basics.pptx" or any other course materials not listed above.
4. When answering, explicitly state which document you're referencing (e.g., "According to ${source_names[0]}...")
5. Be helpful but stay strictly within the bounds of the selected document(s).

Remember: You have access to ONLY ${source_names.join(', ')} and no other documents.`
            : 'You are an AI Study Coach helping students prepare for their assignments. Use the provided course materials to give accurate, helpful responses. Be encouraging and supportive while maintaining academic rigor.'),
        enable_search: true,
        search_params: {
          // Use source_names as primary filter when available
          ...(source_names && source_names.length > 0 && { 
            source_names: source_names 
          }),
          // Still include material_id filtering as backup
          ...(material_ids && material_ids.length > 0 && {
            expr: material_ids.map(id => `material_id == '${id}'`).join(' || ')
          }),
          top_k: override_params.top_k || 5,
          reranker: override_params.reranker !== undefined ? override_params.reranker : true,
          retrieval_type: override_params.retrieval_type || 'chunk',
          output_fields: ['content', 'source_name', 'material_id', 'course_id'],
          prompt_mode: override_params.prompt_mode || 'restricted'
        },
        enable_history: override_params.enable_history !== undefined ? override_params.enable_history : true,
        response_format: { type: 'text' },
        enhance_prompt: {
          timezone: 'MST',
          time: true,
          date: true,
          verbosity: override_params.verbosity || 'detailed'
        }
      },
      // Add override_params to include source_names filtering
      override_params: {
        search_params: {
          source_names: source_names
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
    console.log('Full Payload:', JSON.stringify(payload, null, 2))
    console.log('Search params expr filter:', payload.model_params.search_params.expr)
    
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
    
    // Log search results metadata if available
    if (data.search_results || data.metadata) {
      console.log('\n=== Search Results Metadata ===')
      console.log('Search results:', JSON.stringify(data.search_results || data.metadata, null, 2))
      console.log('===============================\n')
    }
    
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