-- Add deadline_id field to chat_sessions table to allow assignment-specific session histories
ALTER TABLE chat_sessions 
ADD COLUMN deadline_id VARCHAR(255);

-- Create index for better query performance when filtering by deadline_id
CREATE INDEX idx_chat_sessions_deadline_id ON chat_sessions(deadline_id);

-- Create composite index for queries that filter by both course_id and deadline_id
CREATE INDEX idx_chat_sessions_course_deadline ON chat_sessions(course_id, deadline_id);

-- Update the updated_at trigger to include the new column
-- The existing trigger should handle this automatically