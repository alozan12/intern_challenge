# ASU Study Coach Prompts

This directory contains all the system prompts and user prompts used for generating AI content in the ASU Study Coach application.

## Organization

The prompts are organized by feature:

```
prompts/
├── chat/ - Prompts for the chat interface
│   └── study-coach.js - Primary study coach chat prompts
│
├── insights/ - Prompts for generating personalized insights
│   └── index.js - Performance, gaps, and recommendation prompts
│
└── study/ - Prompts for study content generation
    ├── flashcards/ - Flashcard generation prompts
    │   └── index.js
    ├── quiz/ - Quiz generation prompts
    │   └── index.js
    └── evaluation/ - Study content evaluation prompts
        └── index.js (to be implemented)
```

## Usage

Import the prompts in your API routes:

```javascript
import { studyCoachSystemPrompt, attemptFirstGuidancePrompt } from '@/prompts/chat/study-coach';
import { performanceInsightsPrompt } from '@/prompts/insights';
import { learningGapsSystemPrompt } from '@/prompts/study/flashcards';
import { quizSystemPrompt } from '@/prompts/study/quiz';
```

## Prompt Types

1. **System Prompts**: Define the AI's role, capabilities, and constraints
2. **User Prompts**: The actual queries sent to the AI model
3. **Dynamic Templates**: Functions that generate prompts with customized parameters

## Best Practices

- Keep prompts modular and composable
- Use template functions for customization
- Document parameters and expected outcomes
- Update prompts here when adjusting AI behavior