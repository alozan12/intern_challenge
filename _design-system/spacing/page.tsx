import { Card } from '@/components/ui/Card';

export default function SpacingPage() {
  return (
    <div className="ds-section ds-section-spacing">
      <h2 className="ds-section-title font-bold text-gray-900 mb-4" style={{ fontSize: '54px' }}>
        Spacing
      </h2>
      <p className="text-gray-700 mb-6">
        Tailwind spacing scale used for padding, margin, gap, and other spacing properties.
      </p>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spacing Scale</h3>
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-4 text-sm font-semibold text-gray-700 pb-2 border-b">
            <div>Class</div>
            <div>Pixels</div>
            <div>Rem</div>
          </div>
          {[
            { class: '1', px: '4px', rem: '0.25rem' },
            { class: '2', px: '8px', rem: '0.5rem' },
            { class: '3', px: '12px', rem: '0.75rem' },
            { class: '4', px: '16px', rem: '1rem' },
            { class: '5', px: '20px', rem: '1.25rem' },
            { class: '6', px: '24px', rem: '1.5rem' },
            { class: '8', px: '32px', rem: '2rem' },
            { class: '10', px: '40px', rem: '2.5rem' },
            { class: '12', px: '48px', rem: '3rem' },
            { class: '14', px: '56px', rem: '3.5rem' },
            { class: '16', px: '64px', rem: '4rem' },
            { class: '20', px: '80px', rem: '5rem' },
            { class: '24', px: '96px', rem: '6rem' },
          ].map((item) => (
            <div
              key={item.class}
              className="grid grid-cols-3 gap-4 text-sm py-2 border-b border-gray-100"
            >
              <div className="font-mono text-gray-900">{item.class}</div>
              <div className="text-gray-700">{item.px}</div>
              <div className="text-gray-600">{item.rem}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-8 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Usage Examples</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <p className="font-mono">p-4 = padding: 16px</p>
            <p className="font-mono">mt-6 = margin-top: 24px</p>
            <p className="font-mono">gap-8 = gap: 32px</p>
            <p className="font-mono">pt-14 = padding-top: 56px (closest to 54px)</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
