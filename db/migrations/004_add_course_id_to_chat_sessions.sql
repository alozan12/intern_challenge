-- Add course_id field to chat_sessions table
ALTER TABLE chat_sessions 
ADD COLUMN course_id VARCHAR(255);

-- Create index for better query performance when filtering by course_id
CREATE INDEX idx_chat_sessions_course_id ON chat_sessions(course_id);

-- Update composite index to use correct column
DROP INDEX IF EXISTS idx_chat_sessions_course_deadline;
CREATE INDEX idx_chat_sessions_course_deadline ON chat_sessions(course_id, deadline_id);