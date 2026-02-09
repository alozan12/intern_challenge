'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function WebSocketChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  const router = useRouter();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim()
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Prepare AI response placeholder
      const pendingMessage: Message = {
        role: 'assistant',
        content: ''
      };
      
      // Add placeholder message that will be updated incrementally
      setMessages(prev => [...prev, pendingMessage]);
      
      // Create a placeholder for the AI message
      let accumulatedResponse = '';
      
      try {
        // Call our WebSocket API endpoint
        const response = await fetch('/api/ws-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            studentId: '987654', // Example student ID
            courseId: courseId,
            stream: true,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        if (!response.body) {
          throw new Error('Response has no body');
        }
        
        // Create a reader for the response stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
      
        // Process the stream
        try {
          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            
            if (done) break;
            
            // Decode and accumulate the chunk
            const chunk = decoder.decode(value, { stream: !done });
            accumulatedResponse += chunk;
            
            // Update the message content with accumulated response
            setMessages(prev => {
              const updatedMessages = [...prev];
              updatedMessages[updatedMessages.length - 1] = {
                role: 'assistant',
                content: accumulatedResponse
              };
              return updatedMessages;
            });
          }
        } catch (streamError) {
          console.error('Error reading stream:', streamError);
          throw new Error('Error reading response stream');
        }
      }
      
    } catch (error) {
      console.error('Error in chat:', error);
      
      // Update the last message to show the error
      setMessages(prev => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          role: 'assistant',
          content: 'I apologize, but I encountered an error while processing your request. Please try again later.'
        };
        return updatedMessages;
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-lg font-medium">ASU Study Coach (WebSocket)</h2>
        <p className="text-sm text-gray-500">
          {courseId ? `Course: ${courseId}` : 'Ask me about your courses'}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Send a message to start chatting with your Study Coach</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-100 ml-12'
                  : 'bg-gray-100 mr-12'
              }`}
            >
              {message.content || (message.role === 'assistant' && isLoading && '...')}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="border-t p-4 flex">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`bg-blue-600 text-white px-4 py-2 rounded-r-lg flex items-center justify-center ${
            isLoading || !inputValue.trim()
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-700'
          }`}
          disabled={isLoading || !inputValue.trim()}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}