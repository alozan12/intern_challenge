// Test the final implementation with enhanced queries
// Run with: node test-final-implementation.js

const fetch = require('node-fetch');

async function testImplementation(description, payload) {
  const baseUrl = 'http://localhost:3000';
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: ${description}`);
  console.log('='.repeat(60));
  console.log('Query:', payload.query);
  
  try {
    const response = await fetch(`${baseUrl}/api/createai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (data.success) {
      const responseLower = data.response.toLowerCase();
      
      // Check for unwanted database_basics mentions
      const hasDbBasics = responseLower.includes('database_basics') || 
                          responseLower.includes('database basics');
      
      console.log(`\nUnwanted document mentions: ${hasDbBasics ? '❌ YES' : '✅ NO'}`);
      
      // Show response excerpt
      console.log('\nResponse excerpt:');
      console.log(data.response.substring(0, 400) + '...');
      
      return !hasDbBasics;
    } else {
      console.log('Error:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Request failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('Testing final implementation with enhanced queries...\n');
  
  const results = [];
  
  // Test 1: Single document - as the UI would send it now
  results.push({
    name: 'Single document (UI enhanced)',
    success: await testImplementation('Single document selection', {
      query: "Using ONLY the document '1-er_model.pptx', What are the main concepts?",
      material_ids: ["1005"],
      course_ids: ["445567"],
      session_id: `test_single_${Date.now()}`,
      source_names: ["1-er_model.pptx"],
      override_params: {}
    })
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Multiple documents - as the UI would send it now
  results.push({
    name: 'Multiple documents (UI enhanced)',
    success: await testImplementation('Multiple document selection', {
      query: "Using ONLY these documents: 1-er_model.pptx, 5-dimensional_modeling.pptx, Compare these topics",
      material_ids: ["1005", "1006"],
      course_ids: ["445567"],
      session_id: `test_multiple_${Date.now()}`,
      source_names: ["1-er_model.pptx", "5-dimensional_modeling.pptx"],
      override_params: {}
    })
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Complex user query with enhancement
  results.push({
    name: 'Complex query (UI enhanced)',
    success: await testImplementation('Complex user query', {
      query: "Using ONLY the document '1-er_model.pptx', Can you explain how entities relate to each other and give me an example?",
      material_ids: ["1005"],
      course_ids: ["445567"],
      session_id: `test_complex_${Date.now()}`,
      source_names: ["1-er_model.pptx"],
      override_params: {
        temperature: 0.3,
        top_k: 8,
        reranker: true
      }
    })
  });
  
  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('FINAL IMPLEMENTATION TEST RESULTS');
  console.log('='.repeat(60));
  
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
  });
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\nSuccess rate: ${successCount}/${results.length}`);
  
  if (successCount === results.length) {
    console.log('\n🎉 SUCCESS! The implementation correctly filters documents.');
    console.log('\nThe UI now automatically prepends document names to queries,');
    console.log('ensuring the CreateAI API focuses on the selected documents.');
  } else {
    console.log('\n⚠️  Some tests failed. The filtering may still need improvement.');
  }
}

runTests().catch(console.error);