'use client';

import { Clock, Send, Mic, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CodeBlock } from '@/components/ui/Card';
import { SelectPatientButton } from '@/components/ui/SelectPatientButton';

export default function ButtonsPage() {
  return (
    <div className="ds-section ds-section-buttons">
      <h2 className="ds-section-title font-bold text-gray-900 mb-4" style={{ fontSize: '54px' }}>
        Buttons
      </h2>
      <p className="text-gray-700 mb-6">
        Button components with hover effects and different variants for various use cases.
      </p>

      {/* Design Guidelines */}
      <Card className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Design Guidelines</h3>
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold mb-2">Button Sizing</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Default button: minimum width 112px, padding 24-36px</li>
              <li>Small button: minimum width 80px, padding 24-36px</li>
              <li>Extra small button: minimum width 64px, padding 24-36px</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Button Colors & Usage</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Default: Maroon (#8C1D40) - Standard button color</li>
              <li>Primary CTA: Gold (#FFC627) - Use for main call-to-action</li>
              <li>Avoid too many buttons in one area to prevent user confusion</li>
              <li>When multiple CTAs needed: Make primary CTA gold button, others as text links</li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {/* Button Sizes */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Button Sizes</h3>
          <p className="text-sm text-gray-600 mb-4">
            Three standard sizes with minimum width requirements.
          </p>
          <div className="flex flex-wrap gap-4 mb-4 items-center">
            <Button size="default">Default button</Button>
            <Button size="sm">Small button</Button>
            <Button size="xs">X-small button</Button>
          </div>
          <CodeBlock>
            {`<Button size="default">Default button</Button>  // min-w-[112px]
<Button size="sm">Small button</Button>        // min-w-[80px]
<Button size="xs">X-small button</Button>      // min-w-[64px]`}
          </CodeBlock>
        </Card>

        {/* Button Variants */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Button Variants</h3>
          <p className="text-sm text-gray-600 mb-4">
            Six main button variants: Gold (default), Maroon, Grey, Dark, Outline, and Destructive
            Outline.
          </p>
          <div className="flex flex-wrap gap-4 mb-4">
            <Button variant="default">Gold</Button>
            <Button variant="maroon">Maroon</Button>
            <Button variant="grey">Grey</Button>
            <Button variant="dark">Dark (#333)</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive-outline">
              <Trash2 className="w-4 h-4" />
              Destructive
            </Button>
          </div>
          <CodeBlock>
            {`<Button variant="default">Gold</Button>
<Button variant="maroon">Maroon</Button>
<Button variant="grey">Grey</Button>
<Button variant="dark">Dark (#333)</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive-outline">
  <Trash2 className="w-4 h-4" />
  Destructive
</Button>`}
          </CodeBlock>
        </Card>

        {/* Select Patient Button */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Patient Button</h3>
          <p className="text-sm text-gray-600 mb-4">
            Large pill-shaped button for patient selection with mode indicator and status badge.
          </p>
          <div className="flex flex-col gap-4 mb-4">
            <SelectPatientButton
              mode="practice"
              patientName="David"
              isAvailable={true}
              onClick={() => {}}
            />
            <SelectPatientButton
              mode="evaluation"
              patientName="Sarah"
              isAvailable={true}
              onClick={() => {}}
            />
            <SelectPatientButton
              mode="practice"
              patientName="Future Patient"
              isAvailable={false}
              onClick={() => {}}
            />
          </div>
          <CodeBlock>
            {`<SelectPatientButton
  mode="practice"
  patientName="David"
  isAvailable={true}
  onClick={() => {}}
/>

<SelectPatientButton
  mode="evaluation"
  patientName="Sarah"
  isAvailable={true}
  onClick={() => {}}
/>

<SelectPatientButton
  mode="practice"
  patientName="Future Patient"
  isAvailable={false}
  onClick={() => {}}
/>`}
          </CodeBlock>
        </Card>

        {/* Send Button */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Button</h3>
          <p className="text-sm text-gray-600 mb-4">Chat send button using dark variant (#333).</p>
          <Button variant="dark" size="sm">
            Send
            <Send className="w-4 h-4" />
          </Button>
          <CodeBlock className="mt-4">
            {`<Button variant="dark" size="sm">
  Send
  <Send className="w-4 h-4" />
</Button>`}
          </CodeBlock>
        </Card>

        {/* Voice Button */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Input Button</h3>
          <p className="text-sm text-gray-600 mb-4">
            Toggle button for voice input with active state and hover effects.
          </p>
          <div className="flex gap-3 mb-4">
            <Button variant="voice" size="icon">
              <Mic className="w-5 h-5" />
            </Button>
            <Button variant="voice-active" size="icon">
              <Mic className="w-5 h-5" />
            </Button>
          </div>
          <CodeBlock>
            {`<Button variant="voice" size="icon">
  <Mic className="w-5 h-5" />
</Button>

<Button variant="voice-active" size="icon">
  <Mic className="w-5 h-5" />
</Button>`}
          </CodeBlock>
        </Card>
      </div>
    </div>
  );
}
