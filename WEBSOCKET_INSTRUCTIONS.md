# WebSocket Connection Instructions for CreateAI

Based on our testing, we've identified that:

1. The `/query` endpoint works with the developer token
2. The `/project` endpoint and WebSocket connections return authorization errors

Here's a working solution using the direct query API:

## Working API Approach

```javascript
// Example code for querying CreateAI API
const fetch = require('node-fetch');

async function queryAI(question) {
  const token = process.env.CREATE_AI_API_TOKEN;
  const endpoint = 'https://api-main-poc.aiml.asu.edu/query';
  
  const payload = {
    action: "query",
    request_source: "override_params",
    query: question,
    model_provider: "aws",
    model_name: "claude4_5_sonnet",
    session_id: `session_${Date.now()}`,
    model_params: {
      temperature: 0.7,
      system_prompt: "You are the ASU Study Coach, an AI-powered study assistant that helps students with their courses."
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  return data.response;
}
```

## For WebSocket Implementation

Since the WebSocket approach requires different permissions, we recommend:

1. Continue using the REST API for now
2. Request WebSocket access from the CreateAI team
3. Use the WebSocket implementation we've created once access is granted

Our WebSocket client implementation in `lib/createAIWebsocket.ts` is ready to use once the proper permissions are in place.

## Python WebSocket Example

If you need to test with Python, use this working example:

```python
#!/usr/bin/env python3
import uuid
import json
import asyncio
import websockets
import os

# Developer token that works with direct queries
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhc3VyaXRlIjoiYWxvemFuMTIiLCJrZXlfaWQiOiI5YTg4YmM2Ny1mYWYyLTRkYWMtYWMwZi01MmNmOWVhMjM2NTUiLCJ0eXBlIjoiZGV2ZWxvcGVyIiwiYXBpIjoibWFpbiIsImlhdCI6MTc1NzUyMDY5NywiaXNzIjoiYWRtaW4tcG9jIn0.SbkZTQrDgJSZNZUG6ocLj5bMOe-Qps2bmgJ-z8KgbME"

# Test with direct query API (not WebSocket)
async def test_query():
    import aiohttp
    
    url = "https://api-main-poc.aiml.asu.edu/query"
    payload = {
        "action": "query",
        "request_source": "override_params",
        "query": "What is 2+2?",
        "model_provider": "aws",
        "model_name": "claude4_5_sonnet"
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            url,
            headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
            json=payload
        ) as response:
            result = await response.json()
            print("Response:", result["response"])

if __name__ == "__main__":
    asyncio.run(test_query())
```

## Next Steps

1. Continue using the working `/query` endpoint for API calls
2. Request WebSocket permissions from the CreateAI team if needed
3. If WebSocket is critical, consider requesting a different token with the necessary permissions