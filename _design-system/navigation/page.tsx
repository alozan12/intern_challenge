'use client';

import { NavMenu } from '@/components/ui/NavMenu';
import { Card, CodeBlock } from '@/components/ui/Card';

const sampleMenuItems = [
  { href: '#overview', label: 'Overview', isActive: true },
  { href: '#getting-started', label: 'Getting Started', isActive: false },
  { href: '#components', label: 'Components', isActive: false },
  { href: '#documentation', label: 'Documentation', isActive: false },
];

export default function NavigationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Navigation Menu</h1>
        <p className="text-gray-600">
          Reusable navigation menu component with active state indicator
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Default Navigation</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="w-64">
            <NavMenu items={sampleMenuItems} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
        <ul className="space-y-2 text-gray-700">
          <li>
            • <strong>Active State:</strong> Grey background with gold left border (6px)
          </li>
          <li>
            • <strong>Hover State:</strong> Light grey background on non-active items
          </li>
          <li>
            • <strong>Typography:</strong> Medium weight (15px), semibold when active
          </li>
          <li>
            • <strong>Spacing:</strong> Consistent padding (24px horizontal, 14px vertical)
          </li>
          <li>
            • <strong>Transition:</strong> Smooth color and background transitions
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage</h2>
        <Card>
          <CodeBlock>
            {`import { NavMenu } from '@/components/ui/NavMenu';

const items = [
  {
    href: '/student',
    label: 'Student Encounter',
    isActive: true
  },
  {
    href: '/evaluation',
    label: 'AI Evaluation',
    isActive: false
  },
];

<NavMenu
  items={items}
  onItemClick={() => console.log('Item clicked')}
/>`}
          </CodeBlock>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Props</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Prop</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm font-mono text-gray-800">items</td>
                <td className="px-4 py-3 text-sm text-gray-600">NavMenuItem[]</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Array of menu items with href, label, and isActive properties
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-mono text-gray-800">onItemClick</td>
                <td className="px-4 py-3 text-sm text-gray-600">() =&gt; void</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Optional callback triggered when a menu item is clicked
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
