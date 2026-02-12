# Chat Sessions Database Schema

## Overview

The ASU Study Coach application maintains a persistent record of student chat sessions through a PostgreSQL database. This allows students to revisit past study sessions, maintain conversation context across sessions, and switch between regular chat mode and study mode.

## Database Schema

### Chat Sessions Table

The `chat_sessions` table stores metadata about each chat conversation:

```sql
CREATE TABLE chat_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,  -- External session ID used in API
    student_id VARCHAR(255),                 -- Student ID (if authenticated)
    course_id VARCHAR(255),                  -- Course context ID
    preparation_page_id VARCHAR(255),        -- Context for preparation page
    study_mode BOOLEAN DEFAULT FALSE,        -- Whether session is in study mode
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE       -- When the session was ended, NULL if active
);
```

**Indexes:**
```sql
CREATE INDEX idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX idx_chat_sessions_student_id ON chat_sessions(student_id);
CREATE INDEX idx_chat_sessions_course_id ON chat_sessions(course_id);
```

### Chat Messages Table

The `chat_messages` table stores individual messages within a chat session:

```sql
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,       -- References chat_sessions.session_id
    role VARCHAR(50) NOT NULL,              -- 'user' or 'assistant'
    content TEXT NOT NULL,                  -- Message content
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB,     -- Additional metadata like emotion cues
    FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
);
```

**Indexes:**
```sql
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
```

## Features & Implementation

### Session Creation

Sessions are automatically created when:
- A student starts a new conversation
- A student toggles between study modes

Sessions have a unique `session_id` that:
- Maintains conversation context with the AI backend
- Links messages together for retrieval

### Session History

The application provides an interface to:
- View past chat sessions organized by course
- Resume any previous session by loading its conversation history
- Continue conversations where they left off

### Study Mode Toggle

The application supports two chat modes:
1. **Regular Mode**: Standard AI assistance
2. **Study Mode**: Structured learning with attempt-first approach

When toggling between modes:
- The session retains continuity
- Messages remain in the conversation history
- The mode change is recorded in the database

## API Integration

The session management system integrates with:

- **CreateAI API**: Sessions maintain continuity with the AI backend through consistent session IDs
- **Chat Panel Component**: UI displays messages and handles user input
- **Session History Tab**: Shows previous sessions and allows resuming them

## Data Flow

1. User starts a new conversation or selects a previous session
2. `ChatSessionContext` manages the active session state
3. Messages are saved to database as they're created
4. Session metadata is updated when:
   - New messages are added
   - Study mode is toggled
   - Session is ended

## Security Considerations

- Student IDs are used to filter sessions, ensuring students only see their own conversations
- No personally identifiable information beyond student ID is stored
- Session content is specific to course materials, not general-purpose chat

## Future Enhancements

Potential future enhancements include:
- Session tagging for better organization
- Analytics on session duration and frequency
- Export functionality for study notes
- Integration with learning management system (LMS) for session sharing