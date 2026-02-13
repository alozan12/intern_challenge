// Comprehensive test of all filtering variations
// Run with: node test-all-filtering-variations.js

const fetch = require('node-fetch');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testFiltering(testName, payload, expectedDocument) {
  const baseUrl = 'http://localhost:3000';
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST: ${testName}`);
  console.log('='.repeat(80));
  
  console.log('Payload:', JSON.stringify(payload, null, 2));
  
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
      
      // Check for mentions of various documents
      const documentMentions = {
        'er_model': responseLower.includes('er_model') || responseLower.includes('er model'),
        'database_basics': responseLower.includes('database_basics') || responseLower.includes('database basics'),
        'dimensional_modeling': responseLower.includes('dimensional_modeling') || responseLower.includes('dimensional modeling'),
        'normalization': responseLower.includes('normalization'),
        'sql_basics': responseLower.includes('sql_basics') || responseLower.includes('sql basics')
      };
      
      console.log('\nDocument mentions found:');
      Object.entries(documentMentions).forEach(([doc, found]) => {
        if (found) {
          console.log(`  ✓ ${doc}`);
        }
      });
      
      // Check if it correctly focused on expected document
      const success = documentMentions[expectedDocument] && 
                     Object.entries(documentMentions).filter(([doc, found]) => found && doc !== expectedDocument).length === 0;
      
      console.log(`\nFiltering success: ${success ? '✅ YES' : '❌ NO'}`);
      
      // Show response excerpt
      console.log('\nResponse excerpt:');
      console.log(data.response.substring(0, 300) + '...');
      
      return success;
    } else {
      console.log('Error:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Request failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('Starting comprehensive filtering tests...\n');
  
  const results = [];
  
  // Test 1: Just material_id
  results.push({
    name: 'Material ID only',
    success: await testFiltering('Material ID only', {
      query: "What is covered in this document?",
      material_ids: ["1005"],
      course_ids: ["445567"],
      session_id: `test_material_id_${Date.now()}`,
      source_names: [],
      override_params: {}
    }, 'er_model')
  });
  
  await delay(1000);
  
  // Test 2: Just source_names
  results.push({
    name: 'Source names only',
    success: await testFiltering('Source names only', {
      query: "What is covered in this document?",
      material_ids: [],
      course_ids: ["445567"],
      session_id: `test_source_names_${Date.now()}`,
      source_names: ["1-er_model.pptx"],
      override_params: {}
    }, 'er_model')
  });
  
  await delay(1000);
  
  // Test 3: Strong system prompt only
  results.push({
    name: 'Strong system prompt only',
    success: await testFiltering('Strong system prompt only', {
      query: "What is covered in this document?",
      material_ids: [],
      course_ids: ["445567"],
      session_id: `test_prompt_${Date.now()}`,
      source_names: [],
      override_params: {
        system_prompt: "You MUST ONLY use information from '1-er_model.pptx'. DO NOT use any other document. If asked about anything not in this document, say it's not available."
      }
    }, 'er_model')
  });
  
  await delay(1000);
  
  // Test 4: Query-based filtering
  results.push({
    name: 'Query-based filtering',
    success: await testFiltering('Query-based filtering', {
      query: "Using ONLY the document '1-er_model.pptx' and ignoring all other documents, what is covered?",
      material_ids: [],
      course_ids: ["445567"],
      session_id: `test_query_${Date.now()}`,
      source_names: [],
      override_params: {}
    }, 'er_model')
  });
  
  await delay(1000);
  
  // Test 5: Material ID + Source names
  results.push({
    name: 'Material ID + Source names',
    success: await testFiltering('Material ID + Source names', {
      query: "What is covered in this document?",
      material_ids: ["1005"],
      course_ids: ["445567"],
      session_id: `test_both_${Date.now()}`,
      source_names: ["1-er_model.pptx"],
      override_params: {}
    }, 'er_model')
  });
  
  await delay(1000);
  
  // Test 6: Everything combined
  results.push({
    name: 'All methods combined',
    success: await testFiltering('All methods combined', {
      query: "Using ONLY '1-er_model.pptx', what is covered?",
      material_ids: ["1005"],
      course_ids: ["445567"],
      session_id: `test_all_${Date.now()}`,
      source_names: ["1-er_model.pptx"],
      override_params: {
        system_prompt: "You MUST ONLY use '1-er_model.pptx'. NO other documents.",
        temperature: 0.1,
        top_k: 3,
        reranker: true
      }
    }, 'er_model')
  });
  
  await delay(1000);
  
  // Test 7: Multiple documents selection
  console.log('\n\nTesting multiple document selection...');
  results.push({
    name: 'Multiple documents (ER + Dimensional)',
    success: await testFiltering('Multiple documents', {
      query: "What is covered in these documents?",
      material_ids: ["1005", "1006"],
      course_ids: ["445567"],
      session_id: `test_multiple_${Date.now()}`,
      source_names: ["1-er_model.pptx", "5-dimensional_modeling.pptx"],
      override_params: {
        system_prompt: "You can ONLY use information from '1-er_model.pptx' and '5-dimensional_modeling.pptx'. No other documents."
      }
    }, 'er_model')
  });
  
  await delay(1000);
  
  // Test 8: Different document - Dimensional Modeling
  results.push({
    name: 'Different document - Dimensional Modeling',
    success: await testFiltering('Dimensional Modeling only', {
      query: "What is covered in this document?",
      material_ids: ["1006"],
      course_ids: ["445567"],
      session_id: `test_dimensional_${Date.now()}`,
      source_names: ["5-dimensional_modeling.pptx"],
      override_params: {
        system_prompt: "You MUST ONLY use '5-dimensional_modeling.pptx'. NO other documents."
      }
    }, 'dimensional_modeling')
  });
  
  await delay(1000);
  
  // Test 9: Limiting response with top_k=1
  results.push({
    name: 'Extreme limiting - top_k=1',
    success: await testFiltering('Top_k=1 limiting', {
      query: "What is covered in this document?",
      material_ids: ["1005"],
      course_ids: ["445567"],
      session_id: `test_topk1_${Date.now()}`,
      source_names: ["1-er_model.pptx"],
      override_params: {
        top_k: 1,
        reranker: false,
        temperature: 0.1
      }
    }, 'er_model')
  });
  
  await delay(1000);
  
  // Test 10: No course_ids
  results.push({
    name: 'No course IDs',
    success: await testFiltering('No course IDs', {
      query: "What is covered in this document?",
      material_ids: ["1005"],
      course_ids: [],
      session_id: `test_no_course_${Date.now()}`,
      source_names: ["1-er_model.pptx"],
      override_params: {}
    }, 'er_model')
  });
  
  // Summary
  console.log('\n\n' + '='.repeat(80));
  console.log('SUMMARY OF RESULTS');
  console.log('='.repeat(80));
  
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
  });
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\nTotal success rate: ${successCount}/${results.length} (${Math.round(successCount/results.length * 100)}%)`);
  
  // Find the best approach
  const successfulApproaches = results.filter(r => r.success);
  if (successfulApproaches.length > 0) {
    console.log('\n✨ SUCCESSFUL APPROACHES:');
    successfulApproaches.forEach(approach => {
      console.log(`  - ${approach.name}`);
    });
  } else {
    console.log('\n❌ No approach successfully filtered to only the requested document.');
  }
}

// Run the tests
runAllTests().catch(console.error);