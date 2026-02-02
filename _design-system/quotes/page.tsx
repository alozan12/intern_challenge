import { CornerDownRight } from 'lucide-react';
import { Card, CodeBlock } from '@/components/ui/Card';

export default function QuotesPage() {
  return (
    <div className="ds-section ds-section-quotes">
      <h2 className="ds-section-title font-bold text-gray-900 mb-4" style={{ fontSize: '54px' }}>
        Quote Boxes
      </h2>
      <p className="text-gray-700 mb-6">Components for displaying student quotes and evidence.</p>

      <div className="space-y-6">
        {/* Success Quote Box */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Success Quote Box (With Timestamp)
          </h3>
          <div
            className="border border-green-200 bg-green-50 rounded-lg p-6"
            style={{ borderWidth: '4px' }}
          >
            <div className="text-sm font-medium text-gray-900 mb-2">You said:</div>
            <div className="text-base italic text-gray-700 mb-3">
              "Good morning, Mr. Miller. I'm Sarah Chen, a third-year medical student."
            </div>
            <button className="text-sm text-gray-600 hover:text-gray-700 flex items-center gap-1">
              <CornerDownRight className="w-4 h-4" />
              Jump to 00:15
            </button>
          </div>
          <CodeBlock className="mt-4">
            {`<div className="border border-green-200 bg-green-50 rounded-lg p-6"
  style={{ borderWidth: '4px' }}>
  <div className="text-sm font-medium text-gray-900 mb-2">You said:</div>
  <div className="text-base italic text-gray-700 mb-3">Quote text</div>
  <button className="text-sm text-gray-600 hover:text-gray-700">
    Jump to timestamp
  </button>
</div>`}
          </CodeBlock>
        </Card>

        {/* Plain Evidence */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Plain Evidence (No Timestamp)
          </h3>
          <div className="text-sm italic text-gray-700">
            No leading questions detected in transcript
          </div>
          <CodeBlock className="mt-4">
            {`<div className="text-sm italic text-gray-700">Evidence text</div>`}
          </CodeBlock>
        </Card>
      </div>
    </div>
  );
}
