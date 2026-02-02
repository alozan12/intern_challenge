'use client';

import { Card, CodeBlock } from '@/components/ui/Card';

export default function InputsPage() {
  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };
  return (
    <div className="ds-section ds-section-inputs">
      <h2 className="ds-section-title font-bold text-gray-900 mb-4" style={{ fontSize: '54px' }}>
        Form Inputs
      </h2>
      <p className="text-gray-700 mb-6">
        Input fields and form controls used throughout the application.
      </p>

      <div className="space-y-6">
        {/* Text Input */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Input</h3>
          <input
            type="text"
            placeholder="Type your message..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-[15px] bg-white text-gray-900 focus:outline-none focus:border-gray-400"
          />
          <CodeBlock className="mt-4">
            {`<input
  type="text"
  placeholder="Type your message..."
  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-[15px]
    bg-white text-gray-900 focus:outline-none focus:border-gray-400"
/>`}
          </CodeBlock>
        </Card>

        {/* Textarea */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Textarea (Auto-expanding)</h3>
          <p className="text-sm text-gray-600 mb-4">
            Textarea that automatically expands as content grows. Used in NotesTab for clinical
            notes.
          </p>
          <textarea
            placeholder="Add your feedback here..."
            onChange={handleTextareaResize}
            className="w-full p-4 border border-gray-200 rounded-lg text-[15px] leading-relaxed resize-none focus:outline-none focus:border-gray-400 min-h-40 overflow-hidden"
          />
          <CodeBlock className="mt-4">
            {`const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  e.target.style.height = 'auto';
  e.target.style.height = e.target.scrollHeight + 'px';
};

<textarea
  placeholder="Add your feedback here..."
  onChange={handleTextareaResize}
  className="w-full p-4 border border-gray-200 rounded-lg text-[15px]
    leading-relaxed resize-none focus:outline-none focus:border-gray-400
    min-h-40 overflow-hidden"
/>`}
          </CodeBlock>
        </Card>

        {/* Search Input */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Input</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
