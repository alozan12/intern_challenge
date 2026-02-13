// Test variations of the successful approaches
// Run with: node test-successful-approaches.js

const fetch = require('node-fetch');

async function testApproach(testName, payload) {
  const baseUrl = 'http://localhost:3000';
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: ${testName}`);
  console.log('='.repeat(60));
  
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
      
      // Count document mentions
      const mentions = {
        'requested_doc': 0,
        'database_basics': 0,
        'other_docs': 0
      };
      
      // Count mentions of the requested document
      const requestedDoc = payload.source_names?.[0] || '';
      if (requestedDoc) {
        mentions.requested_doc = (responseLower.match(new RegExp(requestedDoc.toLowerCase(), 'g')) || []).length;
      }
      
      // Count mentions of database_basics
      mentions.database_basics = (responseLower.match(/database[_\s]basics/g) || []).length;
      mentions.database_basics += (responseLower.match(/1-database_basics/g) || []).length;
      
      // Check for other document mentions
      const otherDocs = ['dimensional_modeling', 'normalization', 'sql_basics', 'data_warehouse'];
      otherDocs.forEach(doc => {
        mentions.other_docs += (responseLower.match(new RegExp(doc, 'g')) || []).length;
      });
      
      console.log('\nMention counts:');
      console.log(`  Requested document: ${mentions.requested_doc}`);
      console.log(`  Database basics: ${mentions.database_basics}`);
      console.log(`  Other documents: ${mentions.other_docs}`);
      
      // Check specific content
      if (requestedDoc.includes('er_model')) {
        const erTerms = ['entity', 'relationship', 'cardinality', 'attribute', 'primary key'];
        const foundTerms = erTerms.filter(term => responseLower.includes(term));
        console.log(`\nER-specific terms found: ${foundTerms.join(', ')}`);
      }
      
      // Success criteria
      const success = mentions.database_basics === 0 && mentions.requested_doc > 0;
      console.log(`\nSuccess: ${success ? '✅' : '❌'}`);
      
      // Show excerpt
      console.log('\nResponse excerpt:');
      console.log(data.response.substring(0, 400) + '...');
      
      return success;
    }
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

async function runTests() {
  const results = [];
  
  // Test variations of query-based approach
  console.log('Testing query-based variations...\n');
  
  // 1. Simple query mention
  results.push({
    name: 'Simple query mention',
    success: await testApproach('Simple query mention', {
      query: "What does the document '1-er_model.pptx' contain?",
      material_ids: [],
      course_ids: ["445567"],
      session_id: `test_${Date.now()}`,
      source_names: ["1-er_model.pptx"]
    })
  });
  
  // 2. Strong query instruction
  results.push({
    name: 'Strong query instruction',
    success: await testApproach('Strong query instruction', {
      query: "ONLY using '1-er_model.pptx' and NO OTHER documents, explain what this specific file contains",
      material_ids: [],
      course_ids: ["445567"],
      session_id: `test_${Date.now()}`,
      source_names: ["1-er_model.pptx"]
    })
  });
  
  // 3. Query + Material ID
  results.push({
    name: 'Query mention + Material ID',
    success: await testApproach('Query mention + Material ID', {
      query: "Describe the contents of '1-er_model.pptx'",
      material_ids: ["1005"],
      course_ids: ["445567"],
      session_id: `test_${Date.now()}`,
      source_names: ["1-er_model.pptx"]
    })
  });
  
  // 4. Different document test
  results.push({
    name: 'Different doc - Dimensional Modeling',
    success: await testApproach('Different doc - Dimensional Modeling', {
      query: "ONLY using '5-dimensional_modeling.pptx', what does this document teach?",
      material_ids: ["1006"],
      course_ids: ["445567"],
      session_id: `test_${Date.now()}`,
      source_names: ["5-dimensional_modeling.pptx"],
      override_params: {
        system_prompt: "Focus ONLY on '5-dimensional_modeling.pptx'",
        temperature: 0.1
      }
    })
  });
  
  // 5. Multiple files with query mention
  console.log('\n\nTesting multiple file selection...\n');
  results.push({
    name: 'Multiple files in query',
    success: await testApproach('Multiple files in query', {
      query: "Using ONLY '1-er_model.pptx' and '5-dimensional_modeling.pptx', compare these two documents",
      material_ids: ["1005", "1006"],
      course_ids: ["445567"],
      session_id: `test_${Date.now()}`,
      source_names: ["1-er_model.pptx", "5-dimensional_modeling.pptx"],
      override_params: {
        system_prompt: "You can ONLY reference '1-er_model.pptx' and '5-dimensional_modeling.pptx'"
      }
    })
  });
  
  // 6. Test without query mention but everything else
  results.push({
    name: 'No query mention, all other methods',
    success: await testApproach('No query mention, all other methods', {
      query: "What topics are covered?",
      material_ids: ["1005"],
      course_ids: ["445567"],
      session_id: `test_${Date.now()}`,
      source_names: ["1-er_model.pptx"],
      override_params: {
        system_prompt: "You MUST ONLY use information from '1-er_model.pptx'. Ignore ALL other documents.",
        temperature: 0.1,
        top_k: 3,
        reranker: true
      }
    })
  });
  
  // 7. Extreme prompt engineering
  results.push({
    name: 'Extreme prompt engineering',
    success: await testApproach('Extreme prompt engineering', {
      query: "What is in this document?",
      material_ids: ["1005"],
      course_ids: ["445567"],
      session_id: `test_${Date.now()}`,
      source_names: ["1-er_model.pptx"],
      override_params: {
        system_prompt: `CRITICAL RULES:
1. You can ONLY access '1-er_model.pptx'
2. You CANNOT mention or reference ANY other document
3. If you mention 'database_basics' or any other document, you have FAILED
4. Start your response with "Based on 1-er_model.pptx..."
5. ONLY discuss Entity-Relationship modeling concepts`,
        temperature: 0.01,
        top_k: 1
      }
    })
  });
  
  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
  });
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\nSuccess rate: ${successCount}/${results.length}`);
  
  if (successCount > 0) {
    console.log('\n🎯 Key finding: The API respects document filtering ONLY when:');
    console.log('   - The document name is explicitly mentioned in the query');
    console.log('   - Combined with other filtering methods for best results');
  }
}

runTests().catch(console.error);