# Code Style Guide
This document defines the preferred coding patterns and conventions for this codebase to ensure consistency and maintainability.
## Table of Contents
1. [Event Handler Naming](#event-handler-naming)
2. [Async Patterns](#async-patterns)
3. [Error Handling](#error-handling)
4. [TypeScript Conventions](#typescript-conventions)
5. [React and Next.js Patterns](#react-and-nextjs-patterns)
6. [Import Organization](#import-organization)
---
## Event Handler Naming
### Rule: Use handle* for User Interaction Handlers
*Local event handler functions* (functions defined within a component that respond to user actions) should use the handle prefix:
typescript
// :white_check_mark: Good
const handleClick = () => { /* ... */ };
const handleSubmit = async (e: FormEvent) => { /* ... */ };
const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => { /* ... */ };
typescript
// :x: Avoid
const onClick = () => { /* ... */ };
const onSubmit = async (e: FormEvent) => { /* ... */ };
### Rule: Use on* for Callback Props
*Callback props* (functions passed as props to components) should use the on prefix:
typescript
// :white_check_mark: Good
interface ComponentProps {
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  onError: (error: Error) => void;
}

// Usage
<Modal onClose={handleClose} onSubmit={handleSubmit} />
typescript
// :x: Avoid
interface ComponentProps {
  handleClose: () => void;
  handleSubmit: (data: FormData) => Promise<void>;
}
### Rule: Use on* for Event Listener Registration
When registering event listeners or setting up callbacks on external systems (e.g., providers, adapters), use the on prefix:
typescript
// :white_check_mark: Good
provider.onMessage((message) => { /* ... */ });
provider.onError((error) => { /* ... */ });
adapter.onConnect(() => { /* ... */ });
### Summary
- **handle*** → Local component event handlers (implementation)
- **on*** → Callback props and event listener registration (API/interface)
---
## Async Patterns
### Rule: Prefer async/await Over Promise Chaining
For better readability and maintainability, prefer async/await syntax over .then() and .catch() chaining.
typescript
// :white_check_mark: Good
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
typescript
// :x: Avoid
function fetchData() {
  return fetch('/api/data')
    .then(response => response.json())
    .then(data => {
      return data;
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}
### Exception: Fire-and-Forget Cleanup
When you need to perform cleanup operations that shouldn't block execution (fire-and-forget), .catch() is acceptable for error logging:
typescript
// :white_check_mark: Acceptable for cleanup
provider.disconnect().catch((error) => {
  console.error('Error during cleanup:', error);
});

audioContext.close().catch(console.error);
### Exception: Inline Error Handling for JSON Parsing
When parsing potentially malformed JSON responses, inline .catch() with a fallback is acceptable:
typescript
// :white_check_mark: Acceptable for graceful degradation
const body = await request.json().catch(() => ({}));
const errorData = await response.json().catch(() => ({}));
This pattern gracefully handles JSON parse errors without requiring a full try-catch block.
---
## Error Handling
### Rule: Throw Errors for Initialization and Setup
When errors occur during *initialization, configuration, or setup* (e.g., missing config, connection failures), throw errors to fail fast:
typescript
// :white_check_mark: Good
async function connect(config: ProviderConfig) {
  if (!config.agentId) {
    throw new Error('Agent ID is required');
  }

  const response = await fetch('/api/session', {
    method: 'POST',
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error('Failed to create session');
  }

  return response.json();
}
### Rule: Use Callbacks for Runtime Errors
When errors occur during *runtime operations* (e.g., message processing, connection drops), use callback-based error handling to allow the application to continue:
typescript
// :white_check_mark: Good - Runtime error handling
class Provider {
  private errorCallbacks: ((error: Error) => void)[] = [];

  onError(callback: (error: Error) => void) {
    this.errorCallbacks.push(callback);
  }

  protected emitError(error: Error) {
    this.errorCallbacks.forEach(cb => cb(error));
  }

  private processMessage(data: any) {
    try {
      // Process message
    } catch (error) {
      // Don't throw - emit to allow recovery
      this.emitError(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
### Rule: Combine Both Patterns When Appropriate
Providers and services often need both patterns:
typescript
// :white_check_mark: Good - Using both patterns appropriately
async function connect(config: ProviderConfig): Promise<void> {
  try {
    // Setup phase - throw on failure
    if (!config.agentId) {
      throw new Error('Agent ID is required');
    }

    await this.adapter.connect(config.agentId);

    // Runtime phase - emit errors via callbacks
    this.adapter.onMessage((msg) => {
      try {
        const processed = this.processMessage(msg);
        this.emitMessage(processed);
      } catch (error) {
        this.emitError(error);  // Don't throw - application continues
      }
    });

  } catch (error) {
    // Setup failed - both emit AND throw
    this.emitError(error);
    throw error;
  }
}
### Summary
- *Throw errors* → Initialization, setup, configuration (fail fast)
- *Emit errors via callbacks* → Runtime operations (allow recovery)
- *Both* → Setup phase can both emit (for listeners) and throw (for caller)
---
## TypeScript Conventions
### Rule: Always Use Explicit Return Types for Public Functions
Export public functions and class methods with explicit return types:
typescript
// :white_check_mark: Good
export async function createSession(config: SessionConfig): Promise<Session> {
  // ...
}

export class Provider {
  async connect(config: ProviderConfig): Promise<void> {
    // ...
  }

  getStatus(): ConnectionStatus {
    // ...
  }
}
### Rule: Use JSDoc Comments for Public APIs
Document public functions and classes with JSDoc comments:
typescript
/**
 * Creates a new conversation session
 * @param config - Session configuration
 * @returns Session instance
 * @throws {Error} If configuration is invalid
 */
export async function createSession(config: SessionConfig): Promise<Session> {
  // ...
}
### Rule: Prefer Interfaces Over Type Aliases for Object Shapes
Use interfaces for object shapes and component props:
typescript
// :white_check_mark: Good
interface UserProps {
  name: string;
  email: string;
  onUpdate?: (user: User) => void;
}

// :warning: Acceptable for unions/primitives
type Status = 'idle' | 'loading' | 'success' | 'error';
type ID = string | number;
---
## Additional Conventions
### Code Organization
- Group related state declarations together
- Place helper functions after component definition or in separate utility files
- Keep components focused and single-purpose
### Error Messages
- Use clear, actionable error messages
- Include context about what failed and why
- Suggest remediation when possible
typescript
// :white_check_mark: Good
throw new Error('ElevenLabs agent ID not configured for this patient. Please set NEXT_PUBLIC_ELEVEN_LABS_AGENT_W9J2K7 environment variable.');

// :x: Avoid
throw new Error('Missing config');
### Console Logging
- Use development-only logging with process.env.NODE_ENV === 'development'
- Log errors with console.error, not console.log
- Include contextual information in logs
typescript
// :white_check_mark: Good
if (process.env.NODE_ENV === 'development') {
  console.log('[ProviderName] Connecting with config:', config);
}

console.error('[ProviderName] Failed to connect:', error);
---
## React and Next.js Patterns
### Rule: Use 'use client' Directive for Interactive Components
Components that use React hooks, event handlers, or browser APIs must include the 'use client' directive at the top of the file:
typescript
// :white_check_mark: Good - Client component with interactivity
'use client';

import { useState, useCallback } from 'react';

export function InteractiveComponent() {
  const [count, setCount] = useState(0);
  // ...
}
typescript
// :white_check_mark: Good - Server component (no directive needed)
// No 'use client' - this runs on the server
export function StaticContent({ data }: Props) {
  return <div>{data.title}</div>;
}
### Rule: Use useCallback for Event Handlers Passed as Props
When passing event handlers as props to child components or using them in dependency arrays, wrap them with useCallback to prevent unnecessary re-renders:
typescript
// :white_check_mark: Good
const handleClose = useCallback(() => {
  setIsOpen(false);
}, []);

const handleSubmit = useCallback(async (data: FormData) => {
  await saveData(data);
  onSuccess?.();
}, [onSuccess]);

return <Modal onClose={handleClose} onSubmit={handleSubmit} />;
typescript
// :x: Avoid - Creates new function on every render
return <Modal onClose={() => setIsOpen(false)} />;
### Rule: Name Component Props Interfaces with *Props Suffix
Use the Props suffix for component prop interfaces:
typescript
// :white_check_mark: Good
interface StudentViewProps {
  patientId: string;
  mode?: EncounterMode;
  onTimeExpired?: (sessionId: string) => void;
}

export function StudentView({ patientId, mode, onTimeExpired }: StudentViewProps) {
  // ...
}
typescript
// :x: Avoid
interface StudentViewParams { /* ... */ }
interface IStudentView { /* ... */ }
### Rule: Use refs for Mutable Values That Don't Trigger Re-renders
When you need to store mutable values that shouldn't cause re-renders (e.g., timer IDs, previous values, callback references), use useRef:
typescript
// :white_check_mark: Good
const stopChatRef = useRef<(() => Promise<void>) | null>(null);
const messagesRef = useRef<Message[]>([]);
const timerRef = useRef<NodeJS.Timeout | null>(null);
---
## Import Organization
### Rule: Group and Order Imports Consistently
Organize imports in the following order, separated by blank lines:
1. React and Next.js imports
2. Third-party library imports
3. Local component imports (using @/ alias)
4. Local utility/hook imports
5. Type imports
typescript
// :white_check_mark: Good
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { AvatarPanel } from './AvatarPanel';
import { ConversationPanel } from './ConversationPanel';
import { GlobalMenuButton } from '@/components/layout/GlobalMenuButton';
import { Button } from '@/components/ui/button';

import { useTranscriptCapture } from '@/hooks/useTranscriptCapture';

import type { EncounterPhase, Message, RecordType } from '@/types';
### Rule: Use Path Aliases for Non-Relative Imports
Use the @/ path alias for imports from the project root instead of long relative paths:
typescript
// :white_check_mark: Good
import { Button } from '@/components/ui/button';
import { useRole } from '@/hooks/useRole';
import type { Message } from '@/types';

// :white_check_mark: Also good - relative imports for same-directory files
import { AvatarPanel } from './AvatarPanel';
import { ConversationPanel } from './ConversationPanel';
typescript
// :x: Avoid - long relative paths
import { Button } from '../../../components/ui/button';
import { useRole } from '../../hooks/useRole';
12:18
CLAUDE.md
<!-- OPENSPEC:START -->
# OpenSpec Instructions
These instructions are for AI assistants working in this project.
Always open @/openspec/AGENTS.md when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding
Use @/openspec/AGENTS.md to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines
Keep this managed block so 'openspec update' can refresh the instructions.
<!-- OPENSPEC:END -->
# CLAUDE.md
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
## Project Overview
Patient simulation and evaluation application built with Next.js 15. The application supports three distinct user roles with different views: students conducting patient interviews, faculty reviewing student performance, and evaluation/scoring interfaces.
## Development Commands
    bash
    # Development server (default port 3000)
    pnpm run dev

    # Development on specific port
    PORT=5000 pnpm run dev

    # Production build
    pnpm run build

    # Start production server
    pnpm start

    # TypeScript type checking (runs automatically on pre-commit)
    pnpm run type-check

    # Linting
    pnpm run lint

    # Run tests in watch mode (for development)
    pnpm test

    # Run tests once (used in CI/pre-push hooks)
    pnpm run test:run

    # Run tests with coverage report
    pnpm run test:coverage
## Testing
The project uses *Vitest* as the test framework with React Testing Library for component tests. Tests are configured in vitest.config.ts with jsdom environment.
### Test Structure
All tests live in the __tests__/ directory:
    __tests__/
    ├── setup.ts                    # Global test setup (Testing Library matchers)
    ├── api/                        # API route tests
    │   ├── scores.test.ts
    │   └── transcripts.test.ts
    ├── scoring-engine/             # Scoring engine unit tests
    │   ├── engine.test.ts          # Core scoring logic
    │   ├── matchers.test.ts        # Pattern matching utilities
    │   └── criteria/               # Per-section rubric criteria tests
    │       ├── introduction.test.ts
    │       ├── patient-centered.test.ts
    │       ├── hpi.test.ts
    │       ├── pmh-medications.test.ts
    │       ├── allergy-family.test.ts
    │       ├── social-history.test.ts
    │       ├── ros.test.ts
    │       └── physical-close.test.ts
    └── ui/                         # Component and view tests
        ├── hub.test.tsx
        ├── components/             # UI component tests
        ├── evaluation/             # EvaluationView tests
        ├── faculty/                # Faculty dashboard tests
        ├── student/                # Student view tests
        └── errors/                 # Error handling tests
### Running Tests
    `bash
    pnpm test           # Watch mode (development)
    pnpm run test:run   # Single run (CI/pre-push)
    pnpm run test:coverage  # With coverage report
    Coverage is configured for lib/scoring/, app/api/, and components/ directories.
    ## Architecture`
### Routing Structure
The app uses Next.js 15 App Router with URL-based navigation:
- / → Root landing page (login)
- /hub → Mode selection page (Practice, Evaluation, Faculty Tools)
- /encounters → Patient selection for encounters
- /encounters/[patientId] → Student encounter view with avatar and conversation interface
  - Supports ?mode=practice or ?mode=evaluation query param
  - Transitions through states: encounter → encounter-over → evaluation
- /faculty → Faculty dashboard for reviewing multiple student submissions
- /report → Performance report view (legacy)
- /admin → Admin dashboard
- /design/design-system/* → Design system documentation pages (development)
### View Components Architecture
The encounter page (/encounters/[patientId]) manages three states with corresponding views:
- *StudentView* (components/student/StudentView.tsx) - Grid layout with AvatarPanel (2fr) and ConversationPanel (1fr)
  - AvatarPanel: Video/avatar display with fullscreen support
  - ConversationPanel: Tabbed interface (Chat, Records, Notes)
  - RecordModal: Modal overlay for displaying patient medical records
  - Handles onTimeExpired and onEndEarly callbacks to transition states
- *EvaluationView* (components/evaluation/EvaluationView.tsx) - Dual-pane layout with collapsible transcript
  - Main panel: Score card with percentage, section breakdown, and AI-generated synopsis
  - Rubric sections: Expandable criteria showing pass/fail status with evidence quotes
  - Transcript panel: Synchronized conversation transcript with timestamp linking (click evidence to jump)
  - AI Synopsis: Fetched from /api/synopsis/[sessionId] with typewriter reveal effect
  - Uses state to manage transcript visibility and active timestamp highlighting
- *EncounterOverModal* (components/encounter/EncounterOverModal.tsx) - Transition modal between encounter and evaluation
- *FacultyView* (components/faculty/FacultyView.tsx) - Three-column master-detail layout
  - Left sidebar (350px): Transcript list with search and status filters (All/Needs Review/Reviewed/Flagged)
  - Middle panel: Selected transcript details, student info, video player, score summary
  - Right sidebar: Faculty notes (persistent), approval/flag actions
### Data Architecture
*Medical Records* (data/medicalRecords.ts):
- Single source of truth for patient data (demographics, vitals, labs, history)
- Contains both medicalRecords (detailed records) and patientInfo (summary)
- All records use HTML strings for content formatting
- Used across student view (RecordsTab) and evaluation interfaces
*Type Definitions* (types/index.ts):
- MedicalRecord and MedicalRecords - Patient data structure
- Message - Chat message with sender, text, time, and optional emotionCue for patient emotional state
- TranscriptEntry - Legacy transcript format (Speaker/Patient labels)
- Score, SectionScore, CriterionResult - Scoring system types
- EvalSection, EvalCriterion - UI-ready types for EvaluationView (transformed from Score)
- TranscriptSession, TranscriptSaveRequest - Transcript persistence types
- ReviewStatus - Faculty workflow status ('needs_review' | 'reviewed' | 'flagged')
### Scoring System
The scoring module (lib/scoring/) implements a declarative, non-AI scoring engine based on the SOMME CSA Medical Interview Checklist:
- *engine.ts* - Pure function scoreTranscript() that evaluates messages against rubric criteria
- *rubric.ts* - 88 criteria definitions across 11 sections (Introduction, PCI, HPI, PMH, Medications, etc.)
- *matchers.ts* - Pattern matching utilities with word-boundary matching to prevent false positives
- *types.ts* - Scoring-specific types (MatchRule, RubricCriterion, Score)
- *index.ts* - Module exports
Scoring algorithm: For each criterion, filter messages by speaker, apply match rules (OR logic), extract evidence from first match, aggregate section scores.
*Pattern Matching*: Uses word-boundary regex (\b) for keyword matching to prevent substring false positives (e.g., "eat" won't match "Great"). Supports three match rule types:
- keywords - All keywords must appear as whole words in the same message
- regex - Custom regex pattern matching
- sequence - Ordered phrase sequence within a message window
### Patient Personas
Patient personas (lib/personaConfigs.ts) define unique patient behaviors for the simulation:
*Dynamic Emotional States*: Each patient starts with a baseline emotion (scared, anxious, frustrated) and shifts based on provider behavior:
- Negative shifts occur when providers dismiss concerns, interrupt, or rush
- Positive shifts occur when providers listen, explain, and show empathy
- Emotional state affects patient cooperation and information disclosure
*Gated Information*: Certain details (medication non-compliance, trauma history, family fears) are only revealed when patients reach a trusting emotional state (content).
*Student-Initiated Protocol*: Patients wait silently until the student initiates the conversation, simulating real standardized patient encounters.
*Physical Examination*: Patients provide condition-specific findings when students use examination keywords. An emotional gate requires rapport before cooperation—patients express discomfort if examined while anxious or frustrated.
### AI Synopsis
The evaluation view includes AI-generated feedback using OpenAI's gpt-4o-mini model:
- *Synopsis API* (app/api/synopsis/[sessionId]/route.ts) - Generates feedback from score and transcript
- *Caching* - Generated synopses are stored in the Score model's synopsis field to avoid regeneration
- *Retry logic* - One automatic retry on OpenAI failure before returning error
- *Dependencies* - Uses Vercel AI SDK (@ai-sdk/openai, ai)
- *Environment* - Requires OPENAI_API_KEY environment variable
### API Routes
*Scoring & Evaluation:*
| Route | Method | Description |
|-------|--------|-------------|
| /api/scores | POST | Compute and save score for a session |
| /api/scores/[sessionId] | GET | Retrieve score for specific session |
| /api/transcripts | GET | List transcripts (faculty only, supports reviewStatus filter) |
| /api/transcripts | POST | Save transcript after session ends |
| /api/transcripts/[sessionId] | GET | Retrieve single transcript with messages |
| /api/transcripts/[sessionId]/review | PATCH | Update review status and faculty notes |
| /api/synopsis/[sessionId] | GET | Generate or retrieve cached AI synopsis |
*Conversation Providers:*
| Route | Method | Description |
|-------|--------|-------------|
| /api/anam-session | POST | Create ANAM AI session with persona config |
| /api/eleven-labs | GET | Get ElevenLabs agent configuration |
| /api/eleven-labs/signed-url | GET | Get signed URL for ElevenLabs conversation |
| /api/inworld/session | POST | Create Inworld session |
### State Management
Currently uses React useState for local component state. Key state patterns:
- *localStorage*: Notes persistence (see NotesTab component)
- *URL state*: Active student selection in faculty view could leverage URL params
- *Client components*: All view components are 'use client' for interactivity
### UI Components
- Uses shadcn/ui component system (configured in components.json)
- Custom components in components/ui/:
  - button.tsx - Primary button component with variants
  - MessageBubble.tsx - Chat message display
  - ChatControls.tsx - Microphone, end call controls
  - LoadingScreen.tsx - Full-screen loading state
  - Modal.tsx - Generic modal wrapper
  - Card.tsx, Badge.tsx - Display components
  - AudioVisualizer.tsx - Voice activity visualization
  - Spinner.tsx - Loading indicator
- Tailwind CSS v4 for styling with custom utility classes
- Lucide React for icons throughout
## Git Hooks (Husky)
*Pre-commit* (.husky/pre-commit):
- Runs lint-staged on staged files
- *Commits will be blocked if linting/type errors exist*
*Pre-push* (.husky/pre-push):
- Runs pnpm run test:run (single test run, not watch mode)
- *Pushes will be blocked if any tests fail*
## Code Style and Conventions
*IMPORTANT*: Follow the patterns documented in STYLE_GUIDE.md for:
- Event handler naming (use handle* for local handlers, on* for callback props)
- Async patterns (prefer async/await over Promise chaining)
- Error handling (throw for setup errors, use callbacks for runtime errors)
- TypeScript conventions (explicit return types, JSDoc comments)
12:18
See STYLE_GUIDE.md for detailed examples and guidelines.
## Styling Guidelines
### Tailwind CSS Spacing Conversion
*IMPORTANT*: When the user provides CSS properties in pixels, automatically convert them to the closest standard Tailwind class without needing to be asked.
## Browser Automation (Playwright MCP)
This project has Playwright MCP configured for browser automation. Use it to:
- *Verify UI changes*: After implementing UI modifications, navigate to the relevant page and take a snapshot to confirm the changes render correctly
- *Test user flows*: Walk through multi-step interactions (clicking buttons, filling forms, navigating between pages)
- *Debug visual issues*: Capture screenshots or accessibility snapshots to diagnose layout/rendering problems
- *Validate responsive behavior*: Resize the browser window to test different viewport sizes
### Common Playwright Commands
    # Navigate and inspect a page
    browser_navigate → browser_snapshot

    # Verify a specific element
    browser_snapshot → browser_click (to test interaction)

    # Capture visual evidence
    browser_take_screenshot

    # Test form interactions
    browser_fill_form or browser_type → browser_click (submit)

    # Clean up when done
    browser_close
### When to Use
- After completing UI component work, verify it renders as expected
- When debugging a reported visual bug
- To confirm navigation and routing changes work correctly
- When the user requests visual verification of changes
*Note*: The dev server must be running (pnpm run dev) to test local pages at http://localhost:3000.
## Frontend Development Skills
This project has global Claude skills configured for frontend work. Use the /agent-browser and /react-best-practices skills when applicable.
### React Best Practices (/react-best-practices)
*When to use*: Writing, reviewing, or refactoring React/Next.js components.
Invoke this skill for:
- Creating new React components or Next.js pages
- Implementing data fetching (client or server-side)
- Reviewing code for performance issues
- Optimizing bundle size or load times
- Refactoring existing components
Key patterns covered:
- *Critical*: Eliminating async waterfalls, bundle size optimization
- *High*: Server-side performance with React.cache(), RSC boundaries
- *Medium*: Client-side patterns with SWR, re-render optimization, startTransition
### Browser Automation (/agent-browser)
*When to use*: Testing UI changes, debugging visual issues, or verifying user flows.
Quick workflow:
bash
    agent-browser open http://localhost:3000     # Navigate to page
    agent-browser snapshot -i                     # Get interactive elements with refs
    agent-browser click @e1                       # Click element by ref
    agent-browser screenshot                      # Capture current state
    agent-browser close                           # Clean up

Use for:
- Verifying UI changes render correctly after implementation
- Testing multi-step user interactions (forms, navigation)
- Debugging layout or visual rendering issues
- Capturing screenshots for documentation or review