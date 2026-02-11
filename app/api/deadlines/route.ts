import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// For now, we'll hardcode the student ID
// In a real app, this would come from authentication
const CURRENT_STUDENT_ID = '987655';

export async function GET() {
  try {
    // Query to get all course items with due dates
    const deadlinesResult = await query(`
      SELECT ci.item_id, ci.course_id, ci.item_type, ci.title, ci.due_date, 
             ci.points_possible, ci.latest_score,
             c.course_code, c.course_name
      FROM course_items ci
      JOIN courses c ON ci.course_id = c.course_id
      WHERE ci.student_id = $1
      ORDER BY ci.due_date ASC;
    `, [CURRENT_STUDENT_ID]);

    // Format the deadlines to match our frontend expectations
    const deadlines = deadlinesResult.rows.map(item => {
      // Parse the due_date from the database
      // Possible formats: "Jan 15, 2026 by 11:59pm" or "Feb 09, 2026 at 3:30pm"
      let dueDate = null;
      if (item.due_date) {
        try {
          // Parse date with time
          // Format examples: "Jan 15, 2026 by 11:59pm" or "Feb 09, 2026 at 3:30pm"
          let dateStr = item.due_date;
          let timeStr = '';
          
          // Extract date and time parts
          if (dateStr.includes(' by ')) {
            const parts = dateStr.split(' by ');
            dateStr = parts[0]; // e.g., "Jan 15, 2026"
            timeStr = parts[1];  // e.g., "11:59pm"
          } else if (dateStr.includes(' at ')) {
            const parts = dateStr.split(' at ');
            dateStr = parts[0]; // e.g., "Feb 09, 2026"
            timeStr = parts[1];  // e.g., "3:30pm"
          }
          
          // Parse the date
          dueDate = new Date(dateStr);
          
          // Add time if available
          if (timeStr) {
            // Convert 12-hour format to 24-hour
            let hours = 0;
            let minutes = 0;
            
            if (timeStr.includes(':')) {
              const timeParts = timeStr.split(':');
              hours = parseInt(timeParts[0], 10);
              
              // Extract minutes and remove am/pm
              const minutesPart = timeParts[1];
              if (minutesPart.toLowerCase().includes('pm') && hours < 12) {
                hours += 12; // Convert to 24-hour format
              } else if (minutesPart.toLowerCase().includes('am') && hours === 12) {
                hours = 0; // 12am is 0 in 24-hour format
              }
              
              // Extract just the numbers for minutes
              minutes = parseInt(minutesPart.replace(/[^0-9]/g, ''), 10);
            } else {
              // Handle format like "2pm" (no minutes)
              const hoursPart = timeStr.replace(/[^0-9]/g, '');
              hours = parseInt(hoursPart, 10);
              if (timeStr.toLowerCase().includes('pm') && hours < 12) {
                hours += 12;
              } else if (timeStr.toLowerCase().includes('am') && hours === 12) {
                hours = 0;
              }
            }
            
            // Set the time on the date object
            dueDate.setHours(hours, minutes, 0, 0);
          }
          
          // Check if date is valid
          if (isNaN(dueDate.getTime())) {
            throw new Error('Invalid date');
          }
        } catch (err) {
          console.error(`Error parsing date: ${item.due_date}`, err);
          // Use fallback for invalid dates
          dueDate = new Date();
          const itemIdNumber = parseInt(item.item_id);
          const daysToAdd = (itemIdNumber % 10) + 5; // 5-14 days from today
          dueDate.setDate(dueDate.getDate() + daysToAdd);
        }
      } else {
        // For items without a due date, set a future date based on item_id to ensure stability
        dueDate = new Date();
        // Add days based on the last digit of item_id to create a spread of due dates
        const itemIdNumber = parseInt(item.item_id);
        const daysToAdd = (itemIdNumber % 10) + 5; // 5-14 days from today
        dueDate.setDate(dueDate.getDate() + daysToAdd);
      }
      
      // Map item_type to our frontend types (assignment, quiz, exam, discussion)
      let type = 'assignment';
      if (item.item_type === 'quiz') type = 'quiz';
      else if (item.item_type === 'exam') type = 'exam';
      else if (item.item_type === 'discussion') type = 'discussion';
      
      return {
        id: item.item_id,
        title: item.title,
        type: type,
        dueDate: dueDate,
        courseId: item.course_id,
        courseName: item.course_name,
        courseCode: item.course_code,
        pointsPossible: item.points_possible,
        latestScore: item.latest_score
      };
    });
    
    return NextResponse.json({ 
      success: true, 
      deadlines: deadlines 
    });
  } catch (error: any) {
    console.error('Error fetching deadlines:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch deadlines' 
      }, 
      { status: 500 }
    );
  }
}