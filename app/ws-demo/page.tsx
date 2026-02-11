'use client';

import { Suspense } from 'react';
import WebSocketChat from '@/components/preparation/WebSocketChat';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

function WebSocketDemoPageContent() {
  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">WebSocket Chat Demo</h1>
          <p className="text-gray-600">
            This is a demonstration of the CreateAI WebSocket integration for real-time chat responses.
          </p>
        </div>
        
        <div className="h-[600px]">
          <WebSocketChat />
        </div>
      </div>
    </div>
  );
}

function WebSocketDemoLoading() {
  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">WebSocket Chat Demo</h1>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    </div>
  );
}

export default function WebSocketDemoPage() {
  return (
    <Suspense fallback={<WebSocketDemoLoading />}>
      <WebSocketDemoPageContent />
    </Suspense>
  );
}