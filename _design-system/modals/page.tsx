'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Card, CodeBlock } from '@/components/ui/Card';

export default function ModalsPage() {
  const [showBasicModal, setShowBasicModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLargeModal, setShowLargeModal] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Modal</h1>
        <p className="text-gray-600">
          Reusable modal dialog component with overlay and customizable sizes
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Modal</h2>
        <Button onClick={() => setShowBasicModal(true)}>Open Basic Modal</Button>

        <Modal isOpen={showBasicModal} onClose={() => setShowBasicModal(false)} title="Modal Title">
          <p className="text-gray-600 mb-4">
            This is a basic modal with default settings. It includes a header with a close button,
            content area, and an overlay that closes the modal when clicked.
          </p>
          <div className="flex justify-end">
            <Button onClick={() => setShowBasicModal(false)} size="sm">
              Close
            </Button>
          </div>
        </Modal>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Confirmation Modal</h2>
        <Button onClick={() => setShowConfirmModal(true)} variant="destructive-outline">
          Delete Item
        </Button>

        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Deletion"
          showCloseButton={false}
        >
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this item? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button onClick={() => setShowConfirmModal(false)} variant="outline" size="sm">
              Cancel
            </Button>
            <Button
              onClick={() => setShowConfirmModal(false)}
              variant="destructive-outline"
              size="sm"
            >
              Delete
            </Button>
          </div>
        </Modal>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Large Content Modal</h2>
        <Button onClick={() => setShowLargeModal(true)}>Open Large Modal</Button>

        <Modal
          isOpen={showLargeModal}
          onClose={() => setShowLargeModal(false)}
          title="Medical Record"
          maxWidth="2xl"
        >
          <div className="text-gray-700 leading-relaxed mb-6 max-h-[60vh] overflow-y-auto">
            <p className="mb-3">
              <strong>Patient Name:</strong> John Doe
              <br />
              <strong>Age:</strong> 45 years
              <br />
              <strong>Chief Complaint:</strong> Chest pain
            </p>
            <p className="mb-3">
              <strong>History of Present Illness:</strong> The patient is a 45-year-old male who
              presents with acute onset chest pain that started approximately 2 hours ago. The pain
              is described as crushing in nature, radiating to the left arm and jaw.
            </p>
            <p className="mb-3">
              <strong>Past Medical History:</strong> Hypertension, Type 2 Diabetes Mellitus,
              Hyperlipidemia
            </p>
            <p className="mb-3">
              <strong>Medications:</strong> Lisinopril 10mg daily, Metformin 1000mg twice daily,
              Atorvastatin 40mg daily
            </p>
            <p>
              <strong>Physical Examination:</strong> Patient appears anxious and diaphoretic. Blood
              pressure 160/95 mmHg, heart rate 110 bpm, respiratory rate 22/min, temperature 37.2°C.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowLargeModal(false)} size="sm">
              Close
            </Button>
          </div>
        </Modal>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage</h2>
        <Card>
          <CodeBlock>
            {`import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modal Title"
        maxWidth="md"
        showCloseButton={true}
      >
        <p>Modal content goes here</p>
        <Button onClick={() => setIsOpen(false)}>
          Close
        </Button>
      </Modal>
    </>
  );
}`}
          </CodeBlock>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Props</h2>
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Prop</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Default</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm font-mono text-gray-800">isOpen</td>
                <td className="px-4 py-3 text-sm text-gray-600">boolean</td>
                <td className="px-4 py-3 text-sm text-gray-600">-</td>
                <td className="px-4 py-3 text-sm text-gray-600">Controls modal visibility</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-mono text-gray-800">onClose</td>
                <td className="px-4 py-3 text-sm text-gray-600">() =&gt; void</td>
                <td className="px-4 py-3 text-sm text-gray-600">-</td>
                <td className="px-4 py-3 text-sm text-gray-600">Callback when modal is closed</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-mono text-gray-800">title</td>
                <td className="px-4 py-3 text-sm text-gray-600">string</td>
                <td className="px-4 py-3 text-sm text-gray-600">-</td>
                <td className="px-4 py-3 text-sm text-gray-600">Modal header title</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-mono text-gray-800">maxWidth</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  'sm' | 'md' | 'lg' | 'xl' | '2xl'
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">'md'</td>
                <td className="px-4 py-3 text-sm text-gray-600">Maximum width of modal</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-mono text-gray-800">showCloseButton</td>
                <td className="px-4 py-3 text-sm text-gray-600">boolean</td>
                <td className="px-4 py-3 text-sm text-gray-600">true</td>
                <td className="px-4 py-3 text-sm text-gray-600">Show X button in header</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
        <Card>
          <ul className="space-y-2 text-gray-700">
            <li>
              • <strong>Overlay:</strong> Semi-transparent black overlay (30% opacity)
            </li>
            <li>
              • <strong>Close on overlay click:</strong> Modal closes when clicking outside
            </li>
            <li>
              • <strong>Centered positioning:</strong> Modal is centered on screen
            </li>
            <li>
              • <strong>Responsive:</strong> Adapts to mobile with padding
            </li>
            <li>
              • <strong>Customizable width:</strong> Five size options from sm to 2xl
            </li>
            <li>
              • <strong>Optional close button:</strong> Can hide X button for confirmation modals
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
