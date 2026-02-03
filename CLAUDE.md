# ASU Study Coach: AI-Powered Study Assistant

## Project Overview
The ASU Study Coach is an AI-powered study assistant application built with Next.js and TypeScript. It creates personalized study materials by leveraging Canvas course content, including assignments, quizzes, lectures, and other module content. The application follows a NotebookLM-style interface that allows students to interact with course-specific AI support, create various study materials, and engage in spaced retrieval practice. The primary goal is to help students identify learning gaps and provide effective study strategies to improve academic performance.

## Core Features

### 1. Canvas Integration
- LTI-based Canvas app with read-only access
- Integrates with courses, modules, pages, assignments, rubrics, and quiz metadata
- Accesses only student-specific grade data (no instructor or peer data)

### 2. Study Feed Interface
- Daily study page embedded in Canvas
- Displays upcoming deadlines (7-day window)
- Provides 1-2 AI-recommended study actions
- Offers structured study session options (10-minute boost, 30-minute focus)

### 3. Learning Gap Detection
- Identifies weak areas through:
  - Low rubric scores
  - Missed practice items
  - Missed/late submissions
  - Gaps between content access and assessment
- Provides transparent explanations to students about detected gaps

### 4. AI Study Coach
- Course-specific AI support (no general-purpose AI)
- Guided learning flow:
  1. Student attempt/explanation required first
  2. Hints and scaffolding provided
  3. Short retrieval check (1-3 questions)
  4. Scheduled follow-up reviews
- Multiple support modes (Study Mode, Exam Mode)

### 5. Spaced Retrieval Practice
- Generates varied practice activities:
  - Short answer questions
  - Multiple choice questions
  - Concept explanations
  - Flashcards
- Implements spaced repetition scheduling (1�3�7 day intervals)
- Sends practice reminders

### 6. Student Action Menus
- Provides choice when weaknesses are detected:
  - Practice now option
  - Example review
  - Office hours question preparation
- Emphasizes student agency and engagement

## UI Structure

### Top Bar
- Persistent toolbar across the application for quick access to study tools
- Features include:
  - Pomodoro Timer: Focus/break time management with 25/5 minute intervals
  - Reminders: View and set upcoming task notifications
  - AI Study Assistant: Quick chat interface for course-related questions
  - Study Group: Connect with online study partners
- Designed to be customizable by students in future versions

### Landing Page
- Quick access dashboard with modular design
- Filtered deadlines view as primary content:
  - Chronological list of all upcoming deadlines across courses
  - Search functionality for deadline title and course name
  - Dropdown filters for course and assignment type (assignments, quizzes, exams, discussions)
  - Color-coded deadline types and course indicators
  - "Prepare" buttons linking to preparation pages
- Interactive mini-calendar showing upcoming events with deadline indicators
- Brief analytics section showing general progress metrics

### Preparation Page (NotebookLM-style)
Three-panel layout:
1. **Left Panel (25% of UI)**:
   - Tab 1: Session History (saves previous study sessions)
   - Tab 2: Knowledge Base (preloaded content from Canvas with toggle options)

2. **Middle Panel** (50%):
   - Chat interface for open-ended questions about course content

3. **Right Panel** (25%):
   - Content creation area with plus icon to create different study materials
   - Created content added to a persistent list
   - Saved study content
   - Click option opens learning experiences (expandable to full screen)

### Analytics Page
- Compilation of statistics from all courses
- Visualizations for confidence metrics and overall progress
- Performance trends over time

### Courses Page
- Comprehensive list of all courses
- All deadlines with preparation options
- Quick access to course-specific study materials

### Calendar Page
- Full calendar view of academic schedule
- Visual indicators for deadlines and events
- Click interaction to navigate to specific dates

## Development Commands
```bash
# Development server (default port 3000)
npm run dev

# Development on specific port
PORT=5000 npm run dev

# Production build
npm run build

# Start production server
npm start

# TypeScript type checking
npm run type-check

# Linting
npm run lint

# Run tests
npm test
```

## Design Principles
- **Effort-Enhancing**: Guides thinking rather than replacing it
- **Attempt-First**: Requires student engagement before providing help
- **Course-Anchored**: All AI support tied to specific course content
- **Supportive Analytics**: Provides actionable next steps (no risk labeling)
- **Student Agency**: Recommends rather than commands
- **Privacy & Transparency**: Minimal data use with visible explanations
 
## Implementation Scope
- Student-facing Canvas app
- Course-aware AI coaching
- Spaced retrieval practice system
- Transparent weakness detection
- Basic learning analytics

## Success Metrics
- **Learning**: Improved assessment scores and rubric performance
- **Behavior**: Earlier and more distributed study activity
- **Sentiment**: Student reports of preparedness and reduced cramming

## Technical Requirements
- Canvas LTI integration
- Read-only API access to Canvas data
- AI guardrails to prevent misuse
- Privacy-preserving data handling

## Code Style and Conventions
This project follows the coding patterns and conventions defined in the style_guide.md file. Refer to this document for detailed guidelines on:
- Event handler naming
- Async patterns
- Error handling
- TypeScript conventions
- React and Next.js patterns
- Import organization