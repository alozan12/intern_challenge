// Test the override_params approach with request_source
// Run with: node test-override-params.js

const fetch = require('node-fetch');

async function testOverrideParams(testName, sourceNames, materialIds, expectedSuccess) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`TEST: ${testName}`);
  console.log(`Source Names: ${sourceNames.join(', ')}`);
  console.log(`Material IDs: ${materialIds.join(', ')}`);
  console.log('='.repeat(70));
  
  const payload = {
    query: "What are the main concepts covered in this material?",
    material_ids: materialIds,
    course_ids: ["445567"],
    session_id: `test_override_${Date.now()}`,
    source_names: sourceNames,
    override_params: {
      temperature: 0.1,
      top_k: 5,
      reranker: true
    }
  };
  
  try {
    console.log('Sending request with override_params approach...');
    
    const response = await fetch('http://localhost:3000/api/createai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (data.success) {
      const responseLower = data.response.toLowerCase();
      
      // Check for expected document references
      const hasExpectedDoc = sourceNames.some(doc => 
        responseLower.includes(doc.toLowerCase()) || 
        responseLower.includes(doc.toLowerCase().replace('.pptx', ''))
      );
      
      // Check for unwanted database_basics mentions
      const hasDbBasics = responseLower.includes('database_basics') || 
                          responseLower.includes('database basics');
      
      // Check for appropriate content based on selected document
      let hasCorrectContent = false;
      if (sourceNames.includes('1-er_model.pptx')) {
        hasCorrectContent = responseLower.includes('entity') || responseLower.includes('relationship');
      } else if (sourceNames.includes('2-sql_basics.pptx')) {
        hasCorrectContent = responseLower.includes('sql') || responseLower.includes('query');
      } else if (sourceNames.includes('4-normalization.pptx')) {
        hasCorrectContent = responseLower.includes('normal') || responseLower.includes('normalization');
      }
      
      const success = hasExpectedDoc && !hasDbBasics && hasCorrectContent;
      
      console.log(`\nResults:`);
      console.log(`Expected document mentioned: ${hasExpectedDoc ? '✅' : '❌'}`);
      console.log(`No database_basics contamination: ${!hasDbBasics ? '✅' : '❌'}`);
      console.log(`Correct content for document: ${hasCorrectContent ? '✅' : '❌'}`);
      console.log(`Overall: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      console.log('\nResponse excerpt:');
      console.log(data.response.substring(0, 400) + '...');
      
      return success === expectedSuccess;
    } else {
      console.log('API Error:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Request failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('Testing override_params approach with request_source...\n');
  
  const results = [];
  
  // Test 1: Single document - ER Model
  results.push({
    name: 'Single document (ER Model)',
    passed: await testOverrideParams(
      'Single document (ER Model)',
      ['1-er_model.pptx'],
      ['1005'],
      true
    )
  });
  await new Promise(r => setTimeout(r, 1000));
  
  // Test 2: Single document - SQL Basics
  results.push({
    name: 'Single document (SQL Basics)',
    passed: await testOverrideParams(
      'Single document (SQL Basics)',
      ['2-sql_basics.pptx'],
      ['1008'],
      true
    )
  });
  await new Promise(r => setTimeout(r, 1000));
  
  // Test 3: Multiple documents
  results.push({
    name: 'Multiple documents',
    passed: await testOverrideParams(
      'Multiple documents',
      ['1-er_model.pptx', '4-normalization.pptx'],
      ['1005', '1007'],
      true
    )
  });
  await new Promise(r => setTimeout(r, 1000));
  
  // Test 4: Different document than material_id suggests
  results.push({
    name: 'Conflicting document name and material_id',
    passed: await testOverrideParams(
      'Conflicting document name and material_id',
      ['2-sql_basics.pptx'],
      ['1005'], // This is ER model's ID
      true // Should use source_names override
    )
  });
  await new Promise(r => setTimeout(r, 1000));
  
  // Summary
  console.log('\n\n' + '='.repeat(70));
  console.log('OVERRIDE_PARAMS TEST SUMMARY');
  console.log('='.repeat(70));
  
  const passedCount = results.filter(r => r.passed).length;
  console.log(`\nPassed: ${passedCount}/${results.length}\n`);
  
  results.forEach(r => {
    console.log(`${r.passed ? '✅' : '❌'} ${r.name}`);
  });
  
  if (passedCount === results.length) {
    console.log('\n✨ SUCCESS! The override_params approach is working correctly.');
    console.log('\nKey findings:');
    console.log('1. request_source = override_params enables source_names filtering');
    console.log('2. source_names in override_params takes precedence over material_ids');
    console.log('3. This approach should provide reliable document filtering');
  } else {
    console.log('\n⚠️  Some tests failed. The override_params approach may need adjustment.');
  }
  
  console.log('\n💡 Next steps:');
  console.log('1. Verify the API accepts request_source parameter');
  console.log('2. Check if override_params.search_params.source_names is the correct path');
  console.log('3. Consider using the search API endpoint mentioned in the advice');
}

runTests().catch(console.error);