// CreateAI API integration for Study Buddy
// This module handles communication with the CreateAI platform for AI-powered study assistance

/**
 * Sends a query to CreateAI with selected materials context via our API route
 * @param query The user's question
 * @param material_ids Selected material IDs
 * @param course_ids Selected course IDs
 * @param session_id Optional session ID for conversation history
 * @returns The AI response
 */
export async function queryCreateAI(
  query: string,
  material_ids: string[],
  course_ids: string[],
  session_id?: string,
  source_names?: string[],
  override_params?: Record<string, any>
): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    console.log('\n=== CreateAI Client Request ===');
    console.log('Sending to /api/createai with:');
    console.log('- Query:', query);
    console.log('- Material IDs:', material_ids);
    console.log('- Course IDs:', course_ids);
    console.log('- Session ID:', session_id);
    console.log('- Source Names:', source_names || []);
    console.log('- Override Params:', JSON.stringify(override_params || {}));
    console.log('===============================\n');
    
    const response = await fetch('/api/createai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        material_ids,
        course_ids,
        session_id,
        source_names,
        override_params
      })
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get response')
    }
    
    return {
      success: true,
      response: data.response
    }
  } catch (error) {
    console.error('Error querying CreateAI:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to query AI'
    }
  }
}

/**
 * Wrapper function that calls our API route
 */
export async function sendQueryToCreateAI(
  query: string,
  material_ids: string[],
  course_ids: string[],
  session_id?: string,
  source_names?: string[],
  override_params?: Record<string, any>
): Promise<{ success: boolean; response?: string; error?: string }> {
  return queryCreateAI(query, material_ids, course_ids, session_id, source_names, override_params)
}