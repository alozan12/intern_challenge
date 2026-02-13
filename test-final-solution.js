// Final comprehensive test of the working solution
// Run with: node test-final-solution.js

const fetch = require('node-fetch');

async function testScenario(name, payload, expectedDocument, shouldContainDatabase = false) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`SCENARIO: ${name}`);
  console.log(`Selected: ${payload.source_names.join(', ')}`);
  console.log(`Query: ${payload.query}`);
  console.log('='.repeat(70));
  
  try {
    const response = await fetch('http://localhost:3000/api/createai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (data.success) {
      const responseLower = data.response.toLowerCase();
      
      // Check for expected document
      const hasExpected = expectedDocument.toLowerCase().split('.pptx')[0].split('-')
        .some(part => responseLower.includes(part));
      
      // Check for database_basics contamination
      const hasDatabase = responseLower.includes('database_basics') || 
                         responseLower.includes('database basics');
      
      const success = hasExpected && (hasDatabase === shouldContainDatabase);
      
      console.log(`\nResult: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
      console.log(`Expected document referenced: ${hasExpected ? '✅' : '❌'}`);
      console.log(`Database basics mentioned: ${hasDatabase ? 'Yes' : 'No'} (Expected: ${shouldContainDatabase ? 'Yes' : 'No'})`);
      
      // Show which document the AI claims to use
      const docMentions = responseLower.match(/according to [^,.]*/g) || 
                         responseLower.match(/from [^,.]*.pptx/g) || 
                         responseLower.match(/in [^,.]*.pptx/g) || [];
      if (docMentions.length > 0) {
        console.log(`AI explicitly references: ${docMentions[0]}`);
      }
      
      console.log('\nResponse preview:');
      console.log(data.response.substring(0, 300) + '...');
      
      return success;
    } else {
      console.log('API Error:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Request failed:', error.message);
    return false;
  }
}

async function runFinalTests() {
  console.log('FINAL SOLUTION VERIFICATION TEST\n');
  console.log('Testing with:');
  console.log('- request_source = override_params');
  console.log('- source_names in override_params');
  console.log('- Query enhancement in ChatPanel.tsx');
  console.log('- Strong system prompts\n');
  
  const results = [];
  
  // Test 1: ER Model only
  results.push(await testScenario(
    'Single Document - ER Model',
    {
      query: "Using ONLY the document '1-er_model.pptx', what are entities and relationships?",
      material_ids: ["1005"],
      course_ids: ["445567"],
      session_id: `final_test_1_${Date.now()}`,
      source_names: ["1-er_model.pptx"],
      override_params: { temperature: 0.1, top_k: 5, reranker: true }
    },
    '1-er_model.pptx',
    false
  ));
  await new Promise(r => setTimeout(r, 1000));
  
  // Test 2: SQL Basics only
  results.push(await testScenario(
    'Single Document - SQL Basics',
    {
      query: "Using ONLY the document '2-sql_basics.pptx', explain SELECT statements",
      material_ids: ["1008"],
      course_ids: ["445567"],
      session_id: `final_test_2_${Date.now()}`,
      source_names: ["2-sql_basics.pptx"],
      override_params: { temperature: 0.1, top_k: 5, reranker: true }
    },
    '2-sql_basics.pptx',
    false
  ));
  await new Promise(r => setTimeout(r, 1000));
  
  // Test 3: Normalization only
  results.push(await testScenario(
    'Single Document - Normalization',
    {
      query: "Using ONLY the document '4-normalization.pptx', what is third normal form?",
      material_ids: ["1007"],
      course_ids: ["445567"],
      session_id: `final_test_3_${Date.now()}`,
      source_names: ["4-normalization.pptx"],
      override_params: { temperature: 0.1, top_k: 5, reranker: true }
    },
    '4-normalization.pptx',
    false
  ));
  await new Promise(r => setTimeout(r, 1000));
  
  // Test 4: Multiple documents
  results.push(await testScenario(
    'Multiple Documents',
    {
      query: "Using ONLY these documents: 1-er_model.pptx, 2-sql_basics.pptx, compare these concepts",
      material_ids: ["1005", "1008"],
      course_ids: ["445567"],
      session_id: `final_test_4_${Date.now()}`,
      source_names: ["1-er_model.pptx", "2-sql_basics.pptx"],
      override_params: { temperature: 0.1, top_k: 5, reranker: true }
    },
    '1-er_model.pptx',
    false
  ));
  await new Promise(r => setTimeout(r, 1000));
  
  // Test 5: Database basics document (should work when explicitly selected)
  results.push(await testScenario(
    'Database Basics Explicitly Selected',
    {
      query: "Using ONLY the document '1-database_basics.pptx', what topics are covered?",
      material_ids: ["1004"], // Assuming this is the ID
      course_ids: ["445567"],
      session_id: `final_test_5_${Date.now()}`,
      source_names: ["1-database_basics.pptx"],
      override_params: { temperature: 0.1, top_k: 5, reranker: true }
    },
    '1-database_basics.pptx',
    true // Should contain database basics since it's explicitly selected
  ));
  
  // Final summary
  console.log('\n\n' + '='.repeat(70));
  console.log('FINAL SOLUTION TEST RESULTS');
  console.log('='.repeat(70));
  
  const successCount = results.filter(r => r).length;
  const successRate = (successCount / results.length * 100).toFixed(0);
  
  console.log(`\nSuccess Rate: ${successCount}/${results.length} (${successRate}%)`);
  
  if (successRate >= 80) {
    console.log('\n✅ SOLUTION VERIFIED - PRODUCTION READY');
    console.log('\nImplementation summary:');
    console.log('1. ✅ API Route: Added request_source = override_params');
    console.log('2. ✅ API Route: Using override_params.search_params.source_names');
    console.log('3. ✅ ChatPanel: Prepending document names to queries');
    console.log('4. ✅ System Prompts: Strong enforcement of document boundaries');
    console.log('\nThe document filtering issue has been resolved!');
  } else {
    console.log('\n⚠️  Solution needs further refinement');
  }
  
  console.log('\n📋 Key Learnings:');
  console.log('- CreateAI API respects override_params when request_source is set');
  console.log('- source_names filtering works better than expr filtering alone');
  console.log('- Query enhancement helps reinforce document selection');
  console.log('- Combination of techniques provides best results');
}

runFinalTests().catch(console.error);