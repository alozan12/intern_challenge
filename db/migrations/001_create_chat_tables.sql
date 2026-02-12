-- Create chat_sessions table
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

-- Create chat_messages table
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,       -- References chat_sessions.session_id
    role VARCHAR(50) NOT NULL,              -- 'user' or 'assistant'
    content TEXT NOT NULL,                  -- Message content
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB,     -- Additional metadata like emotion cues
    FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX idx_chat_sessions_student_id ON chat_sessions(student_id);
CREATE INDEX idx_chat_sessions_course_id ON chat_sessions(course_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);