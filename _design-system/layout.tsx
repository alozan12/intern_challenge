'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const sectionGroups = [
  {
    title: '',
    items: [{ id: '', label: 'Overview' }],
  },
  {
    title: 'Foundation',
    items: [
      { id: 'colors', label: 'Brand Colors' },
      { id: 'spacing', label: 'Spacing' },
      { id: 'typography', label: 'Typography' },
    ],
  },
  {
    title: 'UI Components',
    items: [
      { id: 'buttons', label: 'Buttons' },
      { id: 'badges', label: 'Badges' },
      { id: 'inputs', label: 'Form Inputs' },
      { id: 'cards', label: 'Cards' },
      { id: 'modals', label: 'Modals' },
      { id: 'icons', label: 'Icons' },
    ],
  },
  {
    title: 'Domain Components',
    items: [
      { id: 'criteria', label: 'Criteria Components' },
      { id: 'quotes', label: 'Quote Boxes' },
      { id: 'messages', label: 'Message Bubbles' },
    ],
  },
  {
    title: 'Interactive',
    items: [
      { id: 'chat-controls', label: 'Chat Controls' },
      { id: 'navigation', label: 'Navigation Menu' },
    ],
  },
];

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Design System</h1>
          <p className="text-sm text-gray-600">Component library</p>
        </div>

        <nav className="pb-6">
          {sectionGroups.map((group, groupIndex) => (
            <div key={groupIndex} className={groupIndex > 0 ? 'mt-6' : ''}>
              {group.title && (
                <div className="px-6 py-1.5 mb-1 flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary-gold rounded-full"></div>
                  <h3 className="text-base font-semibold text-gray-900">{group.title}</h3>
                </div>
              )}
              {group.items.map((item) => {
                const href = item.id ? `/design/design-system/${item.id}` : '/design/design-system';
                const isActive = pathname === href;
                const hasGroupTitle = !!group.title;

                return (
                  <Link
                    key={item.id || 'overview'}
                    href={href}
                    className={`flex items-center w-full py-2 no-underline transition-all cursor-pointer border-l-[6px] font-medium text-sm ${
                      hasGroupTitle ? 'pl-8 pr-6 text-gray-500' : 'px-6 text-gray-600'
                    } ${
                      isActive
                        ? 'bg-gray-100 text-gray-900 border-l-primary-gold font-semibold'
                        : 'border-l-transparent hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="ds-content-container max-w-5xl mx-auto p-8 pt-14">{children}</div>
      </div>
    </div>
  );
}
