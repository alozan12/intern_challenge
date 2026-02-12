# StudyBuddy Database Structure Documentation

## Overview
This document provides a comprehensive overview of the StudyBuddy database schema, including all tables, their relationships, and usage patterns. The database is PostgreSQL-based and supports the AI-powered study assistant application.

## Database Tables

### 1. students
Stores student information for the platform.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| student_id | bigint | PRIMARY KEY, NOT NULL | Unique student identifier |
| name | varchar | NOT NULL | Student's full name |
| email | varchar | NOT NULL | Student's email address |
| created_at | timestamp | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

### 2. courses
Contains course information from Canvas LMS.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| course_id | bigint | PRIMARY KEY, NOT NULL | Unique course identifier |
| course_code | varchar | NOT NULL | Course code (e.g., "CSE 110") |
| course_name | varchar | NULL | Full course name |
| term | varchar | NOT NULL | Academic term |
| created_at | timestamp | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

### 3. enrollments
Junction table linking students to their enrolled courses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| enrollment_id | bigint | PRIMARY KEY, NOT NULL | Unique enrollment identifier |
| student_id | bigint | FOREIGN KEY, NOT NULL | References students.student_id |
| course_id | bigint | FOREIGN KEY, NOT NULL | References courses.course_id |
| enrolled_at | timestamp | DEFAULT CURRENT_TIMESTAMP | Enrollment timestamp |

### 4. course_materials
Stores course learning materials and resources.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| material_id | bigint | PRIMARY KEY, NOT NULL | Unique material identifier |
| course_id | bigint | FOREIGN KEY, NOT NULL | References courses.course_id |
| material_type | varchar | NOT NULL | Type (lecture, assignment, quiz, reading, module) |
| week | integer | NULL | Week number in course schedule |
| title | varchar | NOT NULL | Material title |
| filename | varchar | NULL | Associated filename |
| canvas_url | text | NULL | URL to Canvas resource |
| file_url | text | NULL | Direct file URL |
| text_instruction | text | NULL | Text content/instructions |
| created_at | timestamp | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | timestamp | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

### 5. course_items
Tracks student-specific assignment/deadline information with scores.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| item_id | bigint | PRIMARY KEY, NOT NULL | Unique item identifier |
| student_id | bigint | FOREIGN KEY, NOT NULL | References students.student_id |
| course_id | bigint | FOREIGN KEY, NOT NULL | References courses.course_id |
| material_id | bigint | FOREIGN KEY, NULL | Optional reference to course_materials.material_id |
| item_type | varchar | NOT NULL | Type (assignment, quiz, exam, discussion) |
| title | varchar | NOT NULL | Item title |
| points_possible | integer | NOT NULL | Maximum possible points |
| latest_score | integer | NULL | Student's latest score |
| attempt_count | integer | DEFAULT 0 | Number of submission attempts |
| last_submitted_at | timestamp | NULL | Last submission timestamp |
| due_date | varchar | NULL | Due date string (e.g., "Jan 15, 2026 by 11:59pm") |
| created_at | timestamp | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | timestamp | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

### 6. chat_sessions
Tracks AI chat sessions for study assistance.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| session_id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique session identifier |
| user_id | bigint | NOT NULL | User/Student ID |
| course_id | varchar | NULL | Associated course context |
| deadline_id | varchar | NULL | Associated deadline/assignment |
| title | varchar | NULL | Session title (from first user message) |
| study_mode | boolean | DEFAULT FALSE | Whether session is in study mode |
| created_at | timestamp with time zone | DEFAULT NOW() | Session creation timestamp |
| updated_at | timestamp with time zone | DEFAULT NOW() | Last update timestamp |

### 7. chat_messages
Stores individual messages within chat sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| message_id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique message identifier |
| session_id | uuid | FOREIGN KEY, NOT NULL | References chat_sessions.session_id |
| role | varchar | NOT NULL | Message role ('user' or 'assistant') |
| content | text | NOT NULL | Message content |
| message_sequence | integer | NOT NULL | Order of message in conversation |
| created_at | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP | Message timestamp |

## Entity Relationships

### Primary Relationships:
1. **Students ↔ Courses**: Many-to-many relationship through `enrollments` table
2. **Courses → Course Materials**: One-to-many relationship
3. **Students → Course Items**: One-to-many relationship (personalized deadlines/grades)
4. **Course Items → Course Materials**: Optional many-to-one relationship
5. **Chat Sessions → Chat Messages**: One-to-many relationship

### Foreign Key Constraints:
- `enrollments.student_id` → `students.student_id`
- `enrollments.course_id` → `courses.course_id`
- `course_materials.course_id` → `courses.course_id`
- `course_items.student_id` → `students.student_id`
- `course_items.course_id` → `courses.course_id`
- `course_items.material_id` → `course_materials.material_id` (optional)
- `chat_messages.session_id` → `chat_sessions.session_id` (with CASCADE delete)

## Indexes
The following indexes are created for query performance:
- `idx_chat_sessions_session_id` on chat_sessions(session_id)
- `idx_chat_sessions_student_id` on chat_sessions(student_id)
- `idx_chat_sessions_course_id` on chat_sessions(course_id)
- `idx_chat_sessions_deadline_id` on chat_sessions(deadline_id)
- `idx_chat_sessions_course_deadline` on chat_sessions(course_id, deadline_id)
- `idx_chat_messages_session_id` on chat_messages(session_id)

## Key Implementation Details

### Student ID
- Currently hardcoded as `987655` throughout the application
- Used in API routes: `/api/courses`, `/api/deadlines`, `/api/createai`

### Material Types
The `course_materials.material_type` field typically contains:
- `lecture` - Lecture slides/videos
- `assignment` - Homework assignments
- `quiz` - Quizzes and tests
- `reading` - Reading materials
- `module` - Course modules/sections

### Item Types
The `course_items.item_type` field maps to frontend display types:
- `assignment` → Assignment
- `quiz` → Quiz
- `exam` → Exam
- `discussion` → Discussion

### Date Handling
- Due dates in `course_items` are stored as strings (e.g., "Jan 15, 2026 by 11:59pm")
- The `/api/deadlines` route parses these into proper Date objects
- Supports formats: "DATE by TIME" or "DATE at TIME"

### CreateAI Integration
When querying the AI, the system builds expr filters using:
- `student_id == '987655'`
- `material_id == 'selected_material_ids'`
- `course_id == 'selected_course_ids'`

This allows the AI to access only relevant course materials for context-aware responses.

## API Endpoints Using the Database

### GET /api/courses
Returns all courses a student is enrolled in.
```sql
SELECT c.course_id, c.course_code, c.course_name, c.term
FROM courses c
JOIN enrollments e ON c.course_id = e.course_id
WHERE e.student_id = $1
ORDER BY c.course_name;
```

### GET /api/deadlines
Returns all course items with deadlines for a student.
```sql
SELECT ci.item_id, ci.course_id, ci.item_type, ci.title, ci.due_date, 
       ci.points_possible, ci.latest_score, ci.material_id,
       c.course_code, c.course_name,
       cm.canvas_url
FROM course_items ci
JOIN courses c ON ci.course_id = c.course_id
LEFT JOIN course_materials cm ON ci.material_id = cm.material_id
WHERE ci.student_id = $1
ORDER BY ci.due_date ASC;
```

### GET /api/courses/[courseId]/materials
Returns all materials for a specific course.
```sql
SELECT material_id, course_id, material_type, week, title, 
       filename, canvas_url, file_url, text_instruction
FROM course_materials
WHERE course_id = $1
ORDER BY week ASC, title ASC;
```

### GET /api/db-test
Development endpoint that returns complete database schema information.

## Notes for Future Development

1. **Authentication**: The hardcoded student ID should be replaced with proper authentication
2. **Data Sync**: Consider implementing Canvas LTI integration for real-time data sync
3. **Performance**: Monitor query performance as data grows, especially for the deadlines query
4. **Migrations**: Additional migration files exist but only chat-related tables are currently created
5. **Time Zones**: Chat timestamps use timezone-aware timestamps, but course deadlines use strings