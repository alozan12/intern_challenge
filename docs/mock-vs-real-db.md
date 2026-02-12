# Switching Between Mock and Real Database

## Overview

The ASU Study Coach application supports both mock data and real PostgreSQL database integration. This document explains how to switch between these modes for development and production.

## Configuration Options

### Using Mock Data (Development)

Mock data is useful for development when:
- You don't have a PostgreSQL database set up
- You're working on frontend features that don't require persistent data
- You want predictable data for UI testing

### Using Real Database (Production)

The real database is essential for:
- Persistent storage of chat sessions and messages
- Multi-user environments
- Production deployments

## How to Switch Between Modes

### API Implementation

The chat session API has two implementations:

1. **Mock Implementation** (Currently Active)
   - Located in `/app/api/chat-sessions/route.ts`
   - Uses hardcoded data for sessions and messages
   - No database dependency

2. **Real Database Implementation**
   - Commented out in the codebase
   - Uses PostgreSQL via the `pg` Node.js library
   - Requires database connection configuration

### Steps to Switch to Real Database

1. Ensure PostgreSQL is installed and running
2. Set up environment variables in `.env.local`:
   ```
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=study_coach
   ```

3. Create the database tables by running the migration script:
   ```bash
   psql -U your_username -d study_coach -f db/migrations/001_create_chat_tables.sql
   ```

4. Replace the mock API implementation with the real one:
   ```typescript
   // In /app/api/chat-sessions/route.ts
   
   // Import database operations
   import { 
     createChatSession, 
     updateChatSession, 
     getChatSession,
     getStudentChatSessions,
     saveChatMessage, 
     getChatMessages 
   } from '@/lib/chat-db';
   import { dbMessagesToClientFormat } from '@/lib/dbMessagesToClientFormat';
   
   // Then implement the API functions using these database operations
   // (see the commented version for reference)
   ```

### Steps to Switch to Mock Database

1. Replace the real database implementation with the mock one (currently active)
2. No additional configuration is required

## Checking Which Mode is Active

You can determine which mode is currently active by:

1. Looking at imports in `/app/api/chat-sessions/route.ts`:
   - If it imports from `/lib/chat-db.ts`, it's using the real database
   - If it has hardcoded `mockSessions` and `mockMessages`, it's using mock data

2. Checking server logs:
   - Mock API will log messages like "Returning sessions: {count: X}"
   - Real database will log SQL queries and connection information

## Best Practices

1. **Development with Mock Data**:
   - Use mock data for initial development and UI work
   - Mock data provides consistent test cases
   - Faster local development without database setup

2. **Testing with Real Database**:
   - Test with real database before deployment
   - Verify data persistence and relationships
   - Check performance with larger datasets

3. **Environment-Based Configuration**:
   - Use environment variables to determine which implementation to use
   - For example:
     ```typescript
     const useMockData = process.env.USE_MOCK_DATA === 'true';
     
     export async function GET(req: NextRequest) {
       if (useMockData) {
         // Use mock implementation
       } else {
         // Use real database implementation
       }
     }
     ```

## Troubleshooting

### Mock Data Issues

If you encounter issues with mock data:
- Check the structure of `mockSessions` and `mockMessages` objects
- Verify that IDs and relationships match
- Check that dates are properly formatted

### Real Database Issues

If you encounter issues with the real database:
- Verify PostgreSQL is running (`pg_isready` command)
- Check environment variables are correctly set
- Ensure tables are created with the migration script
- Look for detailed error messages in server logs