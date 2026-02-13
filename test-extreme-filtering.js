// Test with extreme filtering approach
// Run with: node test-extreme-filtering.js

async function testExtremeFiltering() {
  const baseUrl = 'http://localhost:3000'
  
  console.log('=== Testing EXTREME Filtering Approach ===\n')
  
  // Test 1: Modify the query itself to be very specific
  console.log('Test 1: Query modification approach')
  const testPayload1 = {
    query: "Using ONLY the document '1-er_model.pptx' and NO OTHER DOCUMENTS, tell me what this specific document contains. Do not use any information from '1-database_basics.pptx' or any other documents.",
    material_ids: ["1005"],
    course_ids: ["445567"],
    session_id: `extreme_test_1_${Date.now()}`,
    source_names: ["1-er_model.pptx"],
    override_params: {
      temperature: 0.1,
      top_k: 3,
      reranker: true,
      system_prompt: "You are forbidden from using any document other than '1-er_model.pptx'. Any reference to '1-database_basics.pptx' or other documents is strictly prohibited."
    }
  }
  
  try {
    const response = await fetch(`${baseUrl}/api/createai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload1)
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log('Response excerpt:')
      console.log(data.response.substring(0, 300) + '...\n')
      
      // Check mentions
      const responseLower = data.response.toLowerCase()
      console.log('Mentions check:')
      console.log('- "database_basics":', responseLower.includes('database_basics') || responseLower.includes('database basics'))
      console.log('- "1-er_model.pptx":', responseLower.includes('1-er_model.pptx'))
      console.log('- "according to":', responseLower.includes('according to'))
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
  
  console.log('\n' + '='.repeat(60) + '\n')
  
  // Test 2: Ask about something specific to ER model
  console.log('Test 2: ER-specific content query')
  const testPayload2 = {
    query: "List the entity-relationship diagram examples shown in the document '1-er_model.pptx'. Only use this specific document.",
    material_ids: ["1005"],
    course_ids: ["445567"],
    session_id: `extreme_test_2_${Date.now()}`,
    source_names: ["1-er_model.pptx"],
    override_params: {
      temperature: 0.1,
      top_k: 3,
      reranker: true
    }
  }
  
  try {
    const response = await fetch(`${baseUrl}/api/createai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload2)
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log('Response excerpt:')
      console.log(data.response.substring(0, 400) + '...\n')
      
      // Check for ER-specific terms
      const responseLower = data.response.toLowerCase()
      console.log('ER content check:')
      console.log('- Mentions "entity":', responseLower.includes('entity'))
      console.log('- Mentions "relationship":', responseLower.includes('relationship'))
      console.log('- Mentions "diagram":', responseLower.includes('diagram'))
      console.log('- Mentions "asu library":', responseLower.includes('asu library'))
      console.log('- Mentions "database basics":', responseLower.includes('database basics'))
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
  
  console.log('\n' + '='.repeat(60) + '\n')
  
  // Test 3: Negative test - ask about dimensional modeling when selecting ER model
  console.log('Test 3: Negative test - wrong document query')
  const testPayload3 = {
    query: "Tell me about star schemas and fact tables from the document '1-er_model.pptx'",
    material_ids: ["1005"],
    course_ids: ["445567"],
    session_id: `extreme_test_3_${Date.now()}`,
    source_names: ["1-er_model.pptx"],
    override_params: {
      temperature: 0.1,
      top_k: 3,
      reranker: true
    }
  }
  
  try {
    const response = await fetch(`${baseUrl}/api/createai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload3)
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log('Response:')
      console.log(data.response)
      
      // This SHOULD say the information is not in 1-er_model.pptx
      const responseLower = data.response.toLowerCase()
      console.log('\nCorrect behavior check:')
      console.log('- Says "not in this document" or similar:', 
        responseLower.includes('not in this document') || 
        responseLower.includes('not covered') ||
        responseLower.includes('not available') ||
        responseLower.includes('can only provide'))
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testExtremeFiltering()