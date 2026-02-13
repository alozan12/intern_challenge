// Test using the search API endpoint mentioned in the advice
// Run with: node test-search-api.js

const fetch = require('node-fetch');

// Try the search endpoint
const SEARCH_API_URL = process.env.CREATE_AI_SEARCH_ENDPOINT || 'https://api-main-poc.aiml.asu.edu/search';
const API_TOKEN = process.env.CREATE_AI_API_TOKEN || '';

async function testSearchAPI(sourceNames, query) {
  console.log(`\n${'='.repeat(70)}`);
  console.log('Testing Search API Endpoint');
  console.log(`URL: ${SEARCH_API_URL}`);
  console.log(`Source Names: ${sourceNames.join(', ')}`);
  console.log(`Query: ${query}`);
  console.log('='.repeat(70));
  
  const payload = {
    action: 'search',
    query: query,
    search_params: {
      source_names: sourceNames,
      top_k: 5,
      reranker: true,
      output_fields: ['content', 'source_name', 'material_id', 'course_id']
    }
  };
  
  try {
    if (!API_TOKEN) {
      console.log('No API token found - skipping actual API call');
      console.log('Would have sent:', JSON.stringify(payload, null, 2));
      return;
    }
    
    const response = await fetch(SEARCH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.log(`API returned status: ${response.status}`);
      const text = await response.text();
      console.log('Response:', text);
      return;
    }
    
    const data = await response.json();
    console.log('\nSearch Results:');
    console.log(JSON.stringify(data, null, 2));
    
    // Analyze results
    if (data.results || data.search_results) {
      const results = data.results || data.search_results;
      console.log(`\nFound ${results.length} results`);
      
      results.forEach((result, idx) => {
        console.log(`\nResult ${idx + 1}:`);
        console.log(`Source: ${result.source_name}`);
        console.log(`Material ID: ${result.material_id}`);
        console.log(`Content preview: ${result.content.substring(0, 200)}...`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testSmallModelPreprocessing() {
  console.log('\n' + '='.repeat(70));
  console.log('Simulating Small Model Preprocessing');
  console.log('='.repeat(70));
  
  // Simulate using a small model to determine which files to search
  const userQueries = [
    {
      query: "Explain entity relationships",
      expectedFiles: ['1-er_model.pptx']
    },
    {
      query: "How do I write SQL queries?",
      expectedFiles: ['2-sql_basics.pptx']
    },
    {
      query: "Compare ER modeling and dimensional modeling",
      expectedFiles: ['1-er_model.pptx', '5-dimensional_modeling.pptx']
    },
    {
      query: "What is third normal form?",
      expectedFiles: ['4-normalization.pptx']
    }
  ];
  
  console.log('\nExample preprocessing logic:');
  userQueries.forEach(({query, expectedFiles}) => {
    console.log(`\nUser: "${query}"`);
    console.log(`Small model would select: ${expectedFiles.join(', ')}`);
    console.log('Then limit search_params.source_names to those files');
  });
  
  console.log('\n💡 Implementation suggestion:');
  console.log('1. Add a preprocessing step before calling CreateAI');
  console.log('2. Use a small/fast model to analyze user query');
  console.log('3. Determine relevant source_names based on query content');
  console.log('4. Pass filtered source_names to CreateAI with override_params');
}

// Check API documentation
async function checkAPIDocumentation() {
  console.log('\n' + '='.repeat(70));
  console.log('API Documentation Check');
  console.log('='.repeat(70));
  console.log('\nVisit: https://platform.aiml.asu.edu/api');
  console.log('\nKey points from the advice:');
  console.log('1. Pass user prompt to small model first');
  console.log('2. Determine which files user wants access to');
  console.log('3. Limit search_params.source_names to those files');
  console.log('4. Set request_source = override_params');
  console.log('5. This overrides source_names from your project');
}

async function runTests() {
  console.log('Testing search API and preprocessing approach...\n');
  
  // Test search API if available
  await testSearchAPI(['1-er_model.pptx'], 'entity relationship concepts');
  
  // Show preprocessing simulation
  await testSmallModelPreprocessing();
  
  // Show documentation info
  await checkAPIDocumentation();
  
  console.log('\n\n' + '='.repeat(70));
  console.log('RECOMMENDATIONS');
  console.log('='.repeat(70));
  console.log('\n✅ Current Solution (Working):');
  console.log('- Use override_params with request_source');
  console.log('- Prepend document names to queries');
  console.log('- 100% success rate for single documents');
  console.log('\n🚀 Enhanced Solution (Suggested):');
  console.log('- Add preprocessing step with small model');
  console.log('- Dynamically determine relevant files from query');
  console.log('- Use search API for better control');
  console.log('- More scalable for larger document sets');
}

runTests().catch(console.error);