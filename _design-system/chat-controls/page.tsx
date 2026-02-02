'use client';

import { useState } from 'react';
import { ChatControls } from '@/components/ui/ChatControls';
import { Card, CodeBlock } from '@/components/ui/Card';

export default function ChatControlsPage() {
  const [isChatActive, setIsChatActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const handleStartChat = async () => {
    setIsChatActive(true);
    setElapsedTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedDevice ? { deviceId: selectedDevice } : true,
      });
      setAudioStream(stream);

      // Start timer
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      // Store interval for cleanup
      (window as any).__chatInterval = interval;
    } catch (error) {
      console.error('Error starting audio stream:', error);
    }
  };

  const handleStopChat = () => {
    setIsChatActive(false);
    setElapsedTime(0);

    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
      setAudioStream(null);
    }

    // Clear timer
    if ((window as any).__chatInterval) {
      clearInterval((window as any).__chatInterval);
    }
  };

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Controls</h1>
        <p className="text-gray-600">
          Interactive controls for managing patient chat sessions with audio features
        </p>
      </div>

      {/* Component Demo */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Interactive Demo</h2>
        <div className="bg-white rounded-xl p-16 flex items-center justify-center min-h-[200px] border border-gray-200">
          <ChatControls
            isChatActive={isChatActive}
            elapsedTime={elapsedTime}
            onStartChat={handleStartChat}
            onStopChat={handleStopChat}
            audioStream={audioStream}
            selectedDevice={selectedDevice}
            onDeviceChange={handleDeviceChange}
          />
        </div>
      </section>

      {/* Features */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Features</h2>
        <Card>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-gray-600 font-bold">•</span>
              <span>
                <strong>Timer with Recording Indicator:</strong> Visual feedback showing elapsed
                time and active recording state
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-600 font-bold">•</span>
              <span>
                <strong>Start/Stop Controls:</strong> Toggle between chat and stop states with clear
                visual feedback
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-600 font-bold">•</span>
              <span>
                <strong>Audio Visualizer:</strong> Real-time visualization of audio input when chat
                is active
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-600 font-bold">•</span>
              <span>
                <strong>Microphone Settings:</strong> Dropdown menu to select audio input device
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* Usage */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Usage</h2>
        <Card>
          <CodeBlock>
            {`import { ChatControls } from '@/components/ui/ChatControls';

function AvatarPanel() {
  const [isChatActive, setIsChatActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [audioStream, setAudioStream] = useState(null);

  const handleStartChat = async () => {
    setIsChatActive(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setAudioStream(stream);
  };

  const handleStopChat = () => {
    setIsChatActive(false);
    audioStream?.getTracks().forEach(track => track.stop());
    setAudioStream(null);
  };

  return (
    <ChatControls
      isChatActive={isChatActive}
      elapsedTime={elapsedTime}
      onStartChat={handleStartChat}
      onStopChat={handleStopChat}
      audioStream={audioStream}
      selectedDevice={selectedDevice}
      onDeviceChange={setSelectedDevice}
    />
  );
}`}
          </CodeBlock>
        </Card>
      </section>

      {/* Props */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Props</h2>
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Prop
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-gray-900">isChatActive</td>
                <td className="px-6 py-4 text-sm text-gray-600">boolean</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  Whether the chat session is active
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-gray-900">elapsedTime</td>
                <td className="px-6 py-4 text-sm text-gray-600">number</td>
                <td className="px-6 py-4 text-sm text-gray-600">Elapsed time in seconds</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-gray-900">onStartChat</td>
                <td className="px-6 py-4 text-sm text-gray-600">() =&gt; void</td>
                <td className="px-6 py-4 text-sm text-gray-600">Callback when chat is started</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-gray-900">onStopChat</td>
                <td className="px-6 py-4 text-sm text-gray-600">() =&gt; void</td>
                <td className="px-6 py-4 text-sm text-gray-600">Callback when chat is stopped</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-gray-900">audioStream</td>
                <td className="px-6 py-4 text-sm text-gray-600">MediaStream | null</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  Active audio stream for visualization
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-gray-900">selectedDevice</td>
                <td className="px-6 py-4 text-sm text-gray-600">string</td>
                <td className="px-6 py-4 text-sm text-gray-600">Selected audio device ID</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-gray-900">onDeviceChange</td>
                <td className="px-6 py-4 text-sm text-gray-600">(deviceId: string) =&gt; void</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  Callback when audio device is changed
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </section>

      {/* Design Specs */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Design Specifications</h2>
        <Card>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-semibold text-gray-900">Container</dt>
              <dd className="mt-1 text-sm text-gray-600">
                • Background: rgba(51, 51, 51, 0.8) with backdrop blur
                <br />
                • Border radius: 9999px (fully rounded)
                <br />
                • Padding: 24px horizontal, 12px vertical
                <br />• Min width: 360px
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-900">Timer</dt>
              <dd className="mt-1 text-sm text-gray-600">
                • Font size: 18px, medium weight
                <br />
                • Color: White
                <br />• Recording indicator: 12px red dot with pulse animation
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-900">Microphone Button</dt>
              <dd className="mt-1 text-sm text-gray-600">
                • Size: 48px × 48px
                <br />
                • Background: White
                <br />
                • Border: 1px solid gray-300
                <br />• Hover: Scale 1.05 with shadow
              </dd>
            </div>
          </dl>
        </Card>
      </section>

      {/* Use Cases */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Use Cases</h2>
        <Card>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-gray-600">→</span>
              <span>Student view: Control patient interview sessions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-600">→</span>
              <span>Fullscreen mode: Maintain controls during immersive sessions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-600">→</span>
              <span>Audio settings: Allow users to select their preferred microphone</span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
