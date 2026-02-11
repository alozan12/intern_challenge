// Test the chat API functionality directly
const fetch = require('node-fetch');
require('dotenv').config();

async function testChatAPI() {
  // Recreate the exact same functionality as in app/api/chat/route.ts
  const userMessage = "What is 2+2?";
  
  // Set up options similar to the chat API
  const options = {
    modelProvider: 'aws',
    modelName: 'claude4_5_sonnet',
    systemPrompt: 'You are the ASU Study Coach, an AI-powered study assistant that helps students with their courses.',
    sessionId: `student_test_${Date.now()}`,
    enableSearch: false,
    temperature: 0.5,
    context: {
      studentInfo: {
        id: "test123",
        name: "Test Student"
      }
    },
    stream: false
  };
  
  // Build the direct query payload
  const payload = {
    action: 'query',
    request_source: 'override_params',
    query: userMessage,
    model_provider: options.modelProvider,
    model_name: options.modelName,
    session_id: options.sessionId,
    model_params: {
      temperature: options.temperature,
      system_prompt: options.systemPrompt,
      stream: options.stream,
      response_format: { type: 'json' }
    },
    context: options.context
  };
  
  console.log("Testing with endpoint:", process.env.CREATE_AI_API_ENDPOINT);
  console.log("Using token:", process.env.CREATE_AI_API_TOKEN.substring(0, 20) + "...");
  console.log("Request payload:", JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch(process.env.CREATE_AI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CREATE_AI_API_TOKEN}`
      },
      body: JSON.stringify(payload)
    });
    
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log("API Response:", data);
    
    if (data.response) {
      console.log("\nSuccess! Got response:", data.response);
    } else {
      console.log("\nUnexpected response format:", data);
    }
  } catch (error) {
    console.error("Error during API call:", error);
  }
}

// Run the test
testChatAPI().catch(console.error);