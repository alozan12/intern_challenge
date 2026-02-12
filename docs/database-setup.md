# Database Setup Guide

## Overview

The ASU Study Coach application uses PostgreSQL for storing chat sessions and message history. This document provides setup instructions for configuring the database for development and production environments.

## Prerequisites

- PostgreSQL 12+ installed locally or accessible remotely
- Basic understanding of SQL and database management
- Node.js and npm (for running migrations)

## Environment Setup

1. Create a `.env.local` file in the project root with the following database configuration:

```
# Database configuration
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=study_coach
```

For production, set these values in your deployment environment.

## Database Creation

1. Connect to PostgreSQL:

```bash
psql -U postgres
```

2. Create the database:

```sql
CREATE DATABASE study_coach;
```

3. Create a user with appropriate permissions:

```sql
CREATE USER study_coach_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE study_coach TO study_coach_user;
```

## Schema Migration

1. Connect to the database:

```bash
psql -U study_coach_user -d study_coach
```

2. Run the migration script to create tables:

```sql
\i db/migrations/001_create_chat_tables.sql
```

Alternatively, you can run the migration from your application:

```bash
# Using a database migration tool like node-pg-migrate
npx db-migrate up
```

## Table Descriptions

The database contains the following core tables:

### chat_sessions

Stores metadata about each chat conversation:

- `id`: Auto-incremented primary key
- `session_id`: External ID for API continuity
- `student_id`: Reference to the student
- `course_id`: Reference to the course
- `preparation_page_id`: Reference to preparation page
- `study_mode`: Boolean indicating if session is in study mode
- `created_at`: Session creation timestamp
- `updated_at`: Last session update timestamp
- `ended_at`: Session end timestamp (null if active)

### chat_messages

Stores individual messages within a chat session:

- `id`: Auto-incremented primary key
- `session_id`: Reference to chat_sessions.session_id
- `role`: Message author ('user' or 'assistant')
- `content`: Message text content
- `timestamp`: Message creation timestamp
- `metadata`: Additional message metadata (JSON)

## Verifying Setup

To verify your setup is working correctly:

1. Check table creation:

```sql
\dt
```

2. Query for test data:

```sql
SELECT * FROM chat_sessions LIMIT 5;
SELECT * FROM chat_messages LIMIT 5;
```

## Backup and Restore

For backing up your database:

```bash
pg_dump -U study_coach_user -d study_coach > backup_file.sql
```

To restore from a backup:

```bash
psql -U study_coach_user -d study_coach < backup_file.sql
```

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Check PostgreSQL service is running
2. Verify credentials in `.env.local`
3. Ensure network access if connecting to a remote database
4. Check PostgreSQL logs for errors

### Migration Errors

If migrations fail:

1. Ensure user has sufficient privileges
2. Check for syntax errors in migration files
3. Verify the database exists and is accessible

## Development Tips

- Use `lib/db.ts` for database connections
- Use `lib/chat-db.ts` for chat session operations
- For client components, use `lib/chat-sessions-client.ts` which calls the API endpoints instead of directly accessing the database
- Use API routes in `/app/api/chat-sessions/` for client-server communication