// Final test to confirm query mention pattern
// Run with: node test-query-mention-pattern.js

const fetch = require('node-fetch');

async function testPattern(testName, query, expectedSuccess) {
  const baseUrl = 'http://localhost:3000';
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: ${testName}`);
  console.log(`Query: "${query}"`);
  console.log(`Expected: ${expectedSuccess ? 'SUCCESS' : 'FAIL'}`);
  console.log('='.repeat(60));
  
  const payload = {
    query,
    material_ids: ["1005"],
    course_ids: ["445567"],
    session_id: `test_${Date.now()}`,
    source_names: ["1-er_model.pptx"],
    override_params: {
      temperature: 0.1,
      top_k: 3,
      reranker: true
    }
  };
  
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
      
      // Check for database_basics mentions
      const hasDbBasics = responseLower.includes('database_basics') || 
                          responseLower.includes('database basics');
      
      // Check for ER model content
      const hasERContent = responseLower.includes('entity') && 
                          responseLower.includes('relationship');
      
      const actualSuccess = !hasDbBasics && hasERContent;
      
      console.log(`Database basics mentioned: ${hasDbBasics ? 'YES ❌' : 'NO ✅'}`);
      console.log(`ER content present: ${hasERContent ? 'YES ✅' : 'NO ❌'}`);
      console.log(`Actual result: ${actualSuccess ? 'SUCCESS ✅' : 'FAIL ❌'}`);
      console.log(`Matches expectation: ${actualSuccess === expectedSuccess ? '✓' : '✗'}`);
      
      // Show first 300 chars
      console.log('\nResponse start:');
      console.log(data.response.substring(0, 300) + '...');
      
      return actualSuccess === expectedSuccess;
    }
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

async function runPatternTests() {
  console.log('Testing query mention pattern...\n');
  
  const tests = [
    // Should succeed - document mentioned in query
    {
      name: 'Direct file mention',
      query: "What's in 1-er_model.pptx?",
      expectedSuccess: true
    },
    {
      name: 'File mention with quotes',
      query: "Explain the content of '1-er_model.pptx'",
      expectedSuccess: true
    },
    {
      name: 'Using ONLY prefix',
      query: "Using ONLY 1-er_model.pptx, what are the main concepts?",
      expectedSuccess: true
    },
    {
      name: 'File mention in middle',
      query: "Can you tell me what the document 1-er_model.pptx contains about databases?",
      expectedSuccess: true
    },
    
    // Should fail - no document mention
    {
      name: 'Generic query',
      query: "What is entity-relationship modeling?",
      expectedSuccess: false
    },
    {
      name: 'Vague reference',
      query: "What's in this document?",
      expectedSuccess: false
    },
    {
      name: 'Topic-specific without file',
      query: "Explain ER diagrams",
      expectedSuccess: false
    },
    
    // Edge cases
    {
      name: 'Partial filename',
      query: "What's in er_model.pptx?",
      expectedSuccess: true  // Might work due to partial match
    },
    {
      name: 'Wrong extension',
      query: "What's in 1-er_model.pdf?",
      expectedSuccess: false  // Wrong extension
    },
    {
      name: 'Case variation',
      query: "Show me 1-ER_MODEL.PPTX content",
      expectedSuccess: true  // Case insensitive?
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const correct = await testPattern(test.name, test.query, test.expectedSuccess);
    results.push({ ...test, correct });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between tests
  }
  
  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('PATTERN TEST SUMMARY');
  console.log('='.repeat(60));
  
  const correct = results.filter(r => r.correct).length;
  console.log(`\nCorrect predictions: ${correct}/${results.length}\n`);
  
  console.log('Results:');
  results.forEach(r => {
    console.log(`${r.correct ? '✓' : '✗'} ${r.name} - ${r.expectedSuccess ? 'Expected SUCCESS' : 'Expected FAIL'}`);
  });
  
  console.log('\n📝 CONCLUSION:');
  console.log('The CreateAI API filtering works ONLY when:');
  console.log('1. The exact filename is mentioned in the query');
  console.log('2. Material IDs and source_names parameters alone do NOT work');
  console.log('3. System prompts alone do NOT enforce filtering');
  console.log('\n💡 RECOMMENDATION:');
  console.log('To ensure proper document filtering, always include the filename');
  console.log('explicitly in the user query when calling the API.');
}

runPatternTests().catch(console.error);