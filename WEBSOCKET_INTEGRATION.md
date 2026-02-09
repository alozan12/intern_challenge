# CreateAI WebSocket Integration

This document describes how to use the WebSocket integration with CreateAI for real-time streaming responses in the ASU Study Coach application.

## Overview

The WebSocket integration provides a more efficient way to handle streaming responses from the CreateAI service compared to traditional REST API approaches. This is especially useful for chat-based interactions where you want to display responses as they are generated.

## Implementation Components

The implementation consists of three main components:

1. **WebSocket Client** (`lib/createAIWebsocket.ts`): Handles WebSocket connections and payload formatting
2. **API Route** (`app/api/ws-chat/route.ts`): Server-side endpoint that initiates WebSocket connections
3. **Client Component** (`components/preparation/WebSocketChat.tsx`): Frontend component for streaming chat

## Setup

### Environment Variables

Configure the following environment variables in your `.env` file:

```
CREATE_AI_API_TOKEN=your_token_here
CREATE_AI_PROJECT_ID=your_project_id_here
```

The WebSocket endpoint is constructed automatically using these credentials.

### WebSocket Client Usage

```typescript
import { chatWithWebSocket } from '@/lib/createAIWebsocket';

// Create a streaming response
const streamingResponse = await chatWithWebSocket("Your prompt here", {
  modelProvider: 'aws',
  modelName: 'claude4_5_sonnet',
  sessionId: 'unique_session_id',
  systemPrompt: 'Your system instructions here',
  temperature: 0.5,
  context: { /* Any context data */ }
});

// Use with StreamResponse in API routes
return new StreamResponse(streamingResponse);
```

## API Route

The `/api/ws-chat` route demonstrates how to use the WebSocket client in a Next.js API route with Edge Runtime compatibility. It takes user messages and returns a streaming response.

## Client Component

The `WebSocketChat` component shows how to consume the streaming API on the frontend:

1. Send a request to the API route
2. Read the response stream chunk by chunk
3. Update the UI incrementally as chunks arrive

## Demo Page

A demo page is available at `/ws-demo` to test the WebSocket integration.

## Error Handling

The implementation includes proper error handling at all levels:

- WebSocket connection errors
- Message processing errors
- Stream reader errors

## Differences from REST API

WebSockets provide several advantages over REST API for streaming:

1. **Lower Latency**: Messages appear more quickly as they're sent directly
2. **Reduced Overhead**: No HTTP headers for each message chunk
3. **Bidirectional Communication**: Can support more complex interactions
4. **Connection Persistence**: Single connection for the entire conversation

## Limitations

- Requires specific token permissions for WebSocket access
- Limited browser support in older browsers
- Requires careful handling of connection termination

## Testing

You can test the WebSocket implementation by:

1. Visiting `/ws-demo`
2. Sending messages in the chat interface
3. Observing the streaming response behavior

## Troubleshooting

If you encounter issues with the WebSocket connection:

1. Verify your API token has WebSocket permissions
2. Check browser console for connection errors
3. Ensure your project ID is correctly configured
4. Try using the REST API fallback to isolate the issue