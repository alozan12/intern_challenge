import { MessageBubble } from '@/components/ui/MessageBubble';
import { Card, CodeBlock } from '@/components/ui/Card';

export default function MessagesPage() {
  return (
    <div className="ds-section ds-section-messages">
      <h2 className="ds-section-title font-bold text-gray-900 mb-4" style={{ fontSize: '54px' }}>
        Message Bubbles
      </h2>
      <p className="text-gray-700 mb-6">
        Chat message components for the transcript and chat views.
      </p>

      <div className="space-y-6">
        {/* Student Message */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Message</h3>
          <MessageBubble
            sender="student"
            name="You"
            text="Good morning, Mr. Miller. I'm Sarah Chen, a third-year medical student."
            time="00:15"
          />
          <CodeBlock className="mt-4">
            {`<MessageBubble
  sender="student"
  name="You"
  text="Good morning, Mr. Miller. I'm Sarah Chen, a third-year medical student."
  time="00:15"
/>`}
          </CodeBlock>
        </Card>

        {/* Patient Message */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Message</h3>
          <MessageBubble sender="patient" name="David Miller" text="Good morning." time="00:18" />
          <CodeBlock className="mt-4">
            {`<MessageBubble
  sender="patient"
  name="David Miller"
  text="Good morning."
  time="00:18"
/>`}
          </CodeBlock>
        </Card>
      </div>
    </div>
  );
}
