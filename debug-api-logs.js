// Debug script to check API logs and responses
// Run with: node debug-api-logs.js

async function testAPIWithLogging() {
  const baseUrl = 'http://localhost:3000'
  
  console.log('=== Testing API with Detailed Logging ===\n')
  
  // Test selecting ONLY 1-er_model.pptx with detailed logging
  const testPayload = {
    query: "Tell me specifically what is in the ER model document",
    material_ids: ["1005"],
    course_ids: ["445567"],
    session_id: `debug_${Date.now()}`,
    source_names: ["1-er_model.pptx"],
    override_params: {
      temperature: 0.1,
      top_k: 3,
      reranker: true,
      system_prompt: "You are analyzing course materials. Focus ONLY on the specific document requested by the user."
    }
  }
  
  console.log('Sending payload:')
  console.log(JSON.stringify(testPayload, null, 2))
  
  try {
    const response = await fetch(`${baseUrl}/api/createai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    })
    
    const data = await response.json()
    
    console.log('\n=== API Response ===')
    console.log('Success:', data.success)
    
    if (data.success) {
      // Check the actual response content
      console.log('\nFull Response:')
      console.log(data.response)
      
      // Analyze what documents are mentioned
      const responseLower = data.response.toLowerCase()
      console.log('\n=== Document Analysis ===')
      
      const documents = [
        '1-er_model.pptx',
        '1-database_basics.pptx',
        '5-dimensional_modeling.pptx',
        'er model',
        'database basics',
        'dimensional modeling'
      ]
      
      documents.forEach(doc => {
        if (responseLower.includes(doc.toLowerCase())) {
          console.log(`✓ Mentions "${doc}"`)
        } else {
          console.log(`✗ Does not mention "${doc}"`)
        }
      })
      
      // Look for specific content that should be in ER model doc
      const erModelContent = [
        'entity',
        'relationship',
        'attribute',
        'cardinality',
        'primary key',
        'foreign key'
      ]
      
      console.log('\n=== ER Model Content Check ===')
      erModelContent.forEach(term => {
        if (responseLower.includes(term)) {
          console.log(`✓ Contains ER term: "${term}"`)
        }
      })
      
    } else {
      console.log('Error:', data.error)
    }
    
  } catch (error) {
    console.error('Request failed:', error)
  }
}

// Test what happens when we DON'T specify any documents
async function testNoDocumentSelection() {
  console.log('\n\n=== Testing with NO Document Selection ===\n')
  
  const baseUrl = 'http://localhost:3000'
  
  const testPayload = {
    query: "What documents are you using to answer this?",
    material_ids: [],
    course_ids: ["445567"],
    session_id: `debug_no_docs_${Date.now()}`,
    source_names: [],
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
      body: JSON.stringify(testPayload)
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log('Response excerpt:')
      console.log(data.response.substring(0, 500) + '...')
    }
  } catch (error) {
    console.error('Request failed:', error)
  }
}

// Run the tests
testAPIWithLogging().then(() => testNoDocumentSelection())