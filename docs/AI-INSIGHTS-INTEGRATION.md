# AI Insights Integration

This document outlines the integration with CreateAI API for generating personalized student insights in the ASU Study Coach application.

## Overview

The AI Insights feature provides personalized study recommendations and performance analysis based on:
- Student's course performance data
- Identified learning gaps
- Upcoming deadlines
- Learning preferences

The insights are generated using the CreateAI API, which connects to various AI models like Claude and can be customized with specific system prompts.

## Implementation Details

### API Configuration

The integration uses the CreateAI API credentials defined in the `.env.local` file:

```
CREATE_AI_API_TOKEN=eyJhbGciOiJIUzI...
CREATE_AI_API_ENDPOINT=https://api-main-poc.aiml.asu.edu/query
```

### Insight Types

The system supports three types of insights:

1. **Recommendations** - Personalized study suggestions based on learning gaps and upcoming deadlines
2. **Performance** - Analysis of student's academic performance with strengths and weaknesses
3. **Gaps** - Identification of specific knowledge gaps

### Data Flow

1. Frontend components request insights via the `/api/insights` endpoint
2. The API collects relevant student data (performance, gaps, upcoming deadlines)
3. A structured prompt is sent to the CreateAI API with this context
4. The API returns JSON-formatted insights that are mapped to UI components
5. If the API request fails, the system falls back to mock data

### Key Files

- `/app/api/insights/route.ts` - Main API endpoint for insights generation
- `/lib/createAI.ts` - CreateAI API client for authenticated requests
- `/components/landing/AIInsights.tsx` - Frontend component displaying insights
- `/types/index.ts` - Type definitions for insights

## Usage Example

```typescript
// Frontend component requesting insights
const response = await fetch('/api/insights', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    studentId: '987654',
    insightType: 'recommendation'
  })
});

const data = await response.json();
// Process and display insights
```

## Prompt Engineering

The system uses carefully crafted prompts for each insight type:

- Recommendations prompt asks for 2-3 personalized study suggestions with specific fields
- Performance prompt requests strengths, weaknesses, and actionable advice
- Gaps prompt asks for identification of knowledge gaps with confidence levels

## Future Improvements

1. Add caching layer to reduce API calls
2. Implement spaced repetition scheduling based on AI recommendations
3. Add feedback mechanism to improve recommendation quality
4. Connect to real-time Canvas data for more accurate insights