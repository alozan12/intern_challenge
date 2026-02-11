// Simple test for CreateAI direct query endpoint
const fetch = require('node-fetch');

// Get token and endpoint from .env file
require('dotenv').config();

// Simple test function
async function testDirectQuery() {
  const token = process.env.CREATE_AI_API_TOKEN;
  const endpoint = process.env.CREATE_AI_API_ENDPOINT;

  console.log('Testing CreateAI direct query endpoint with fixed payload structure...');
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Using token: ${token.substring(0, 20)}...`);

  // Simple payload for the query endpoint with correct structure
  const payload = {
    action: "query",
    request_source: "override_params",
    query: "What is 2+2?",
    model_provider: "aws",
    model_name: "claude4_5_sonnet",
    model_params: {
      temperature: 0.7,
      system_prompt: "You are a helpful AI assistant.",
      stream: false,
      response_format: { type: 'json' }
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log('Headers:', response.headers);
    console.log('Response:', responseText);

    if (response.ok) {
      try {
        const jsonResponse = JSON.parse(responseText);
        console.log('JSON Response:', jsonResponse);
      } catch (e) {
        console.log('Response is not valid JSON');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testDirectQuery().catch(console.error);