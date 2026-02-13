import { NextResponse } from 'next/server'

// CreateAI API configuration from environment variables
const CREATEAI_API_URL = process.env.CREATE_AI_API_ENDPOINT || 'https://api-main-poc.aiml.asu.edu/search'
const CREATEAI_API_TOKEN = process.env.CREATE_AI_API_TOKEN || ''
const PROJECT_ID = process.env.CREATE_AI_PROJECT_ID || ''

// Hardcoded student ID for now
const STUDENT_ID = '987655'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      query = "test", 
      material_ids = [], 
      course_ids = [], 
      include_metadata = true,
      limit = 10 
    } = body
    
    // Build filters
    const filters: string[] = []
    
    // Add student_id filter
    filters.push(`student_id == '${STUDENT_ID}'`)
    
    // Add material_id filters if provided
    if (material_ids && material_ids.length > 0) {
      const materialFilter = material_ids
        .map((id: string) => `material_id == '${id}'`)
        .join(' || ')
      filters.push(`(${materialFilter})`)
    }
    
    // Add course_id filters if provided
    if (course_ids && course_ids.length > 0) {
      const courseFilter = course_ids
        .map((id: string) => `course_id == '${id}'`)
        .join(' || ')
      filters.push(`(${courseFilter})`)
    }
    
    const expr = filters.join(' && ')
    
    console.log('\n=== CreateAI Search Debug ===');
    console.log('Query:', query);
    console.log('Filters:', expr);
    console.log('=============================\n');
    
    if (!CREATEAI_API_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'CreateAI API token not configured',
        mockData: true,
        results: [
          {
            content: "Mock result - no API token configured",
            source_name: "mock_document.pdf",
            material_id: "mock_001",
            course_id: "mock_course",
            metadata: {
              student_id: STUDENT_ID,
              filename: "mock_document.pdf",
              title: "Mock Document"
            }
          }
        ]
      })
    }
    
    // Build search payload
    const payload = {
      query: query,
      search_params: {
        collection: PROJECT_ID,
        expr: expr,
        top_k: limit,
        output_fields: [
          'content', 
          'source_name', 
          'material_id', 
          'course_id',
          'student_id',
          'filename',
          'title',
          'metadata',
          'tags',
          'page_number',
          'chunk_id'
        ],
        retrieval_type: 'chunk'
      }
    }
    
    console.log('Search Payload:', JSON.stringify(payload, null, 2))
    
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
      console.error('CreateAI Search API error:', response.status, errorText)
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('Search Results:', JSON.stringify(data, null, 2))
    
    // Extract metadata from results
    const results = data.results || data.data || []
    const processedResults = results.map((result: any) => ({
      content: result.content || '',
      source_name: result.source_name || result.metadata?.source_name || '',
      material_id: result.material_id || result.metadata?.material_id || '',
      course_id: result.course_id || result.metadata?.course_id || '',
      filename: result.filename || result.metadata?.filename || '',
      title: result.title || result.metadata?.title || '',
      page_number: result.page_number || result.metadata?.page_number || '',
      chunk_id: result.chunk_id || '',
      score: result.score || 0,
      all_metadata: include_metadata ? result.metadata || {} : undefined
    }))
    
    // Get unique source names
    const uniqueSourceNames = [...new Set(processedResults.map((r: any) => r.source_name).filter(Boolean))]
    const uniqueFilenames = [...new Set(processedResults.map((r: any) => r.filename).filter(Boolean))]
    
    return NextResponse.json({
      success: true,
      query: query,
      filters: expr,
      total_results: processedResults.length,
      unique_source_names: uniqueSourceNames,
      unique_filenames: uniqueFilenames,
      results: processedResults
    })
    
  } catch (error) {
    console.error('Error in CreateAI search route:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to search'
      },
      { status: 500 }
    )
  }
}