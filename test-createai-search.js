// Test script to check CreateAI search and metadata
// Run with: node test-createai-search.js

async function testSearch() {
  const baseUrl = 'http://localhost:3000' // Adjust if using different port
  
  console.log('Testing CreateAI Search API...\n')
  
  try {
    // Test 1: Search with material ID
    console.log('Test 1: Searching with material ID 1005...')
    const response1 = await fetch(`${baseUrl}/api/createai/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'model',
        material_ids: ['1005'],
        course_ids: ['445567'],
        include_metadata: true,
        limit: 5
      })
    })
    
    const data1 = await response1.json()
    console.log('Response:', JSON.stringify(data1, null, 2))
    console.log('\n---\n')
    
    // Test 2: General search to see all documents
    console.log('Test 2: General search to see all available documents...')
    const response2 = await fetch(`${baseUrl}/api/createai/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'the',
        material_ids: [],
        course_ids: ['445567'],
        include_metadata: true,
        limit: 10
      })
    })
    
    const data2 = await response2.json()
    console.log('Unique source names found:', data2.unique_source_names)
    console.log('Unique filenames found:', data2.unique_filenames)
    console.log('Total results:', data2.total_results)
    
    if (data2.results && data2.results.length > 0) {
      console.log('\nFirst result metadata:')
      console.log(JSON.stringify(data2.results[0], null, 2))
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

testSearch()