// Debug script to test material selection
// Run with: node debug-material-selection.js

async function debugMaterialSelection() {
  const baseUrl = 'http://localhost:3000' // Adjust if using different port
  
  console.log('=== Testing Material Selection Debug ===\n')
  
  // Test with different document selections
  const testCases = [
    {
      name: "Select only 1-er_model.pptx",
      source_names: ["1-er_model.pptx"],
      material_ids: ["1005"],
      query: "What is this document about?"
    },
    {
      name: "Select only 5-dimensional_modeling.pptx",
      source_names: ["5-dimensional_modeling.pptx"],
      material_ids: ["1006"],
      query: "What is this document about?"
    },
    {
      name: "Select both documents",
      source_names: ["1-er_model.pptx", "5-dimensional_modeling.pptx"],
      material_ids: ["1005", "1006"],
      query: "What documents are you using?"
    },
    {
      name: "No document selection",
      source_names: [],
      material_ids: [],
      query: "What documents are available?"
    }
  ]
  
  for (const testCase of testCases) {
    console.log(`\n=== Test Case: ${testCase.name} ===`)
    console.log(`Source Names: ${JSON.stringify(testCase.source_names)}`)
    console.log(`Material IDs: ${JSON.stringify(testCase.material_ids)}`)
    console.log(`Query: ${testCase.query}`)
    
    try {
      const response = await fetch(`${baseUrl}/api/createai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: testCase.query,
          material_ids: testCase.material_ids,
          course_ids: ['445567'], // Using the course ID from your tests
          session_id: `debug_session_${Date.now()}`,
          source_names: testCase.source_names,
          override_params: {
            temperature: 0.3,
            top_k: 5,
            reranker: true
          }
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        console.log('\nResponse excerpt:')
        console.log(data.response.substring(0, 200) + '...')
        
        // Look for document mentions in the response
        const response_lower = data.response.toLowerCase()
        const mentions = {
          'database_basics': response_lower.includes('database_basics') || response_lower.includes('database basics'),
          'er_model': response_lower.includes('er_model') || response_lower.includes('er model'),
          'dimensional_modeling': response_lower.includes('dimensional_modeling') || response_lower.includes('dimensional modeling')
        }
        
        console.log('\nDocument mentions in response:')
        Object.entries(mentions).forEach(([doc, mentioned]) => {
          console.log(`- ${doc}: ${mentioned ? '✓ mentioned' : '✗ not mentioned'}`)
        })
      } else {
        console.log('Error:', data.error)
      }
      
    } catch (error) {
      console.error('Request failed:', error.message)
    }
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

// Also check what the CreateAI search endpoint returns
async function checkSearchEndpoint() {
  console.log('\n\n=== Checking CreateAI Search Endpoint ===')
  
  const baseUrl = 'http://localhost:3000'
  
  try {
    const response = await fetch(`${baseUrl}/api/createai/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'model',
        material_ids: [],
        course_ids: ['445567'],
        include_metadata: true,
        limit: 20
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log('Total results:', data.total_results)
      console.log('Unique source names:', data.unique_source_names)
      
      // Count results by source
      const sourceCounts = {}
      data.results.forEach(result => {
        const source = result.source_name || 'unknown'
        sourceCounts[source] = (sourceCounts[source] || 0) + 1
      })
      
      console.log('\nResults by source:')
      Object.entries(sourceCounts).forEach(([source, count]) => {
        console.log(`- ${source}: ${count} chunks`)
      })
    } else {
      console.log('Error:', data.error)
    }
  } catch (error) {
    console.error('Search request failed:', error.message)
  }
}

// Run both tests
debugMaterialSelection().then(() => checkSearchEndpoint())