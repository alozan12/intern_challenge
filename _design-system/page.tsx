import { Card } from '@/components/ui/Card';

export default function DesignSystemPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Design System</h1>
        <p className="text-xl text-gray-600">
          A comprehensive component library and design guide for the Patient Persona application
        </p>
      </div>

      {/* Technology Stack */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Technology Stack</h2>
        <Card>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Core Technologies</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold">•</span>
                  <span>
                    <strong>Next.js 15</strong> - React framework with App Router
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold">•</span>
                  <span>
                    <strong>TypeScript</strong> - Type-safe development
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold">•</span>
                  <span>
                    <strong>Tailwind CSS v4</strong> - Utility-first styling
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold">•</span>
                  <span>
                    <strong>Husky</strong> - Pre-commit hooks for type checking
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">UI Components</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold">•</span>
                  <span>
                    <strong>shadcn/ui</strong> - Base component system
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold">•</span>
                  <span>
                    <strong>Lucide React</strong> - Icon library
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold">•</span>
                  <span>
                    <strong>Custom Components</strong> - Domain-specific UI
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> TypeScript type checking runs automatically before every
              commit. Commits will be blocked if type errors exist.
            </p>
          </div>
        </Card>
      </section>

      {/* Using the Design System */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Using the Design System</h2>
        <Card className="space-y-4">
          <p className="text-gray-700">
            This design system provides all reusable components, patterns, and guidelines used
            throughout the application. Each component page includes:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 font-semibold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Interactive Demos</h4>
                <p className="text-sm text-gray-600">
                  Live component examples you can interact with
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 font-semibold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Code Examples</h4>
                <p className="text-sm text-gray-600">Copy-paste ready implementation code</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 font-semibold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Props Documentation</h4>
                <p className="text-sm text-gray-600">Complete API reference for each component</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 font-semibold">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Design Specs</h4>
                <p className="text-sm text-gray-600">Visual guidelines and spacing rules</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Architecture Notes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Architecture Highlights</h2>
        <Card>
          <dl className="space-y-4">
            <div>
              <dt className="font-semibold text-gray-900 mb-1">Routing Structure</dt>
              <dd className="text-sm text-gray-700">
                App uses Next.js 15 App Router with URL-based navigation. Root redirects to{' '}
                <code className="bg-gray-100 px-1 py-0.5 rounded">/student</code> view.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900 mb-1">View Components</dt>
              <dd className="text-sm text-gray-700">
                Each route has a corresponding View component (StudentView, FacultyView,
                EvaluationView) that orchestrates the page layout.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900 mb-1">Medical Records</dt>
              <dd className="text-sm text-gray-700">
                Single source of truth in{' '}
                <code className="bg-gray-100 px-1 py-0.5 rounded">data/medicalRecords.ts</code>{' '}
                containing patient demographics, vitals, labs, and history.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900 mb-1">Styling Convention</dt>
              <dd className="text-sm text-gray-700">
                Pixel values in CSS are automatically converted to closest Tailwind spacing classes
                for consistency.
              </dd>
            </div>
          </dl>
        </Card>
      </section>

      {/* Component Categories */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Component Categories</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Foundation</h3>
            <p className="text-sm text-gray-600 mb-3">Core design tokens and utilities</p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Brand Colors</li>
              <li>• Spacing System</li>
              <li>• Typography</li>
            </ul>
          </Card>
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">UI Components</h3>
            <p className="text-sm text-gray-600 mb-3">Reusable interface elements</p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Buttons & Badges</li>
              <li>• Form Inputs</li>
              <li>• Cards & Modals</li>
            </ul>
          </Card>
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Domain Components</h3>
            <p className="text-sm text-gray-600 mb-3">Application-specific UI</p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Criteria Components</li>
              <li>• Quote Boxes</li>
              <li>• Message Bubbles</li>
            </ul>
          </Card>
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Interactive</h3>
            <p className="text-sm text-gray-600 mb-3">Complex interaction patterns</p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Chat Controls</li>
              <li>• Navigation Menu</li>
              <li>• Icons</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Resources */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Additional Resources</h2>
        <Card>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-gray-600">→</span>
              <span>
                <strong>Next.js 15 Documentation:</strong>{' '}
                <a
                  href="https://nextjs.org/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-700 underline"
                >
                  nextjs.org/docs
                </a>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-600">→</span>
              <span>
                <strong>Tailwind CSS:</strong>{' '}
                <a
                  href="https://tailwindcss.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-700 underline"
                >
                  tailwindcss.com/docs
                </a>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-600">→</span>
              <span>
                <strong>TypeScript:</strong>{' '}
                <a
                  href="https://www.typescriptlang.org/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-700 underline"
                >
                  typescriptlang.org/docs
                </a>
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
