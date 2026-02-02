import { Card } from '@/components/ui/Card';

export default function TypographyPage() {
  return (
    <div className="ds-section ds-section-typography">
      <h2 className="ds-section-title font-bold text-gray-900 mb-4" style={{ fontSize: '54px' }}>
        Typography
      </h2>
      <p className="text-gray-700 mb-6">
        Typography scale and text styles used throughout the application.
      </p>

      <div className="space-y-6">
        {/* Font Stack */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Font Stack</h3>
          <p className="text-gray-700 mb-4">
            System font stack for optimal performance and native look across platforms.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-mono text-gray-900 mb-2">font-family:</p>
            <p className="text-xs font-mono text-gray-700 leading-relaxed">
              -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
              <br />
              'Helvetica Neue', Arial, sans-serif
            </p>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-700">
              <strong>-apple-system:</strong> San Francisco on macOS and iOS
            </p>
            <p className="text-sm text-gray-700">
              <strong>BlinkMacSystemFont:</strong> System font on macOS
            </p>
            <p className="text-sm text-gray-700">
              <strong>Segoe UI:</strong> Windows system font
            </p>
            <p className="text-sm text-gray-700">
              <strong>Roboto:</strong> Android system font
            </p>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Headings</h3>
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Heading 1</h1>
              <p className="text-sm text-gray-600 mt-1">text-4xl font-bold</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Heading 2</h2>
              <p className="text-sm text-gray-600 mt-1">text-3xl font-bold</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Heading 3</h3>
              <p className="text-sm text-gray-600 mt-1">text-2xl font-bold</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900">Heading 4</h4>
              <p className="text-sm text-gray-600 mt-1">text-xl font-semibold</p>
            </div>
            <div>
              <h5 className="text-lg font-semibold text-gray-900">Heading 5</h5>
              <p className="text-sm text-gray-600 mt-1">text-lg font-semibold</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Body Text</h3>
          <div className="space-y-4">
            <div>
              <p className="text-base text-gray-700">
                Base text - Used for most body content (text-base)
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                Small text - Used for secondary information (text-sm)
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">
                Extra small - Used for labels and captions (text-xs)
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
