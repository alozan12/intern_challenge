import { Card, CardTitle, CardContent, CodeBlock } from '@/components/ui/Card';

export default function CardsPage() {
  return (
    <div className="ds-section ds-section-cards">
      <h2 className="ds-section-title font-bold text-gray-900 mb-4" style={{ fontSize: '54px' }}>
        Cards
      </h2>
      <p className="text-gray-700 mb-6">Card components for organizing content.</p>

      <div className="space-y-6">
        {/* Basic Card */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Card</h3>
          <Card>
            <CardTitle>Card Title</CardTitle>
            <CardContent>
              Card content goes here. This is a standard card used throughout the application.
            </CardContent>
          </Card>
          <CodeBlock className="mt-4">
            {`import { Card, CardTitle, CardContent } from '@/components/ui/Card';

<Card>
  <CardTitle>Card Title</CardTitle>
  <CardContent>
    Card content goes here...
  </CardContent>
</Card>`}
          </CodeBlock>
        </div>

        {/* Code Block */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Block</h3>
          <CodeBlock>
            {`import { CodeBlock } from '@/components/ui/Card';

<CodeBlock>
  Your code here...
</CodeBlock>`}
          </CodeBlock>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> CodeBlock is a variant of the Card component with the same
              padding (p-8) and border styling, optimized for displaying code snippets.
            </p>
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Card</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">2/3</div>
              <div className="text-xs text-gray-600">Opening</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">4/4</div>
              <div className="text-xs text-gray-600">Organization</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">0/3</div>
              <div className="text-xs text-gray-600">Closing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
