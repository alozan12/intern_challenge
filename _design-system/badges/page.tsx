import { Badge } from '@/components/ui/Badge';
import { Card, CodeBlock } from '@/components/ui/Card';

export default function BadgesPage() {
  return (
    <div className="ds-section ds-section-badges">
      <h2 className="ds-section-title font-bold text-gray-900 mb-4" style={{ fontSize: '54px' }}>
        Badges
      </h2>
      <p className="text-gray-700 mb-6">
        Badge components for displaying status, categories, and other labels.
      </p>

      <div className="space-y-6">
        {/* All Variants */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Badge Variants</h3>
          <p className="text-sm text-gray-600 mb-4">
            Available badge styles for different contexts.
          </p>
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
          </div>
          <CodeBlock>
            {`<Badge variant="primary">Primary</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>`}
          </CodeBlock>
        </Card>

        {/* Sizes */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Badge Sizes</h3>
          <p className="text-sm text-gray-600 mb-4">
            Three available sizes to fit different contexts.
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium (Default)</Badge>
            <Badge size="lg">Large</Badge>
          </div>
          <CodeBlock>
            {`<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>`}
          </CodeBlock>
        </Card>

        {/* Usage Examples */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Examples</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-8 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Mode indicator:</span>
              <Badge variant="primary">Practice Mode</Badge>
            </div>
            <div className="flex items-center gap-3 p-8 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Status:</span>
              <Badge variant="success">Reviewed</Badge>
              <Badge variant="warning">Needs Review</Badge>
            </div>
            <div className="flex items-center gap-3 p-8 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Score labels:</span>
              <Badge variant="success" size="sm">
                Passed
              </Badge>
              <Badge variant="error" size="sm">
                Failed
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
