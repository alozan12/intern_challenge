import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Query to get the list of tables in the database
    const tablesResult = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    // Get the table structure for each table
    const tables = tablesResult.rows;
    const tableDetails = [];

    for (const table of tables) {
      const tableName = table.table_name;
      
      // Get column information for each table
      const columnsResult = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);
      
      // Get a sample of data (first 5 rows)
      const sampleDataResult = await query(`
        SELECT * FROM "${tableName}" LIMIT 5;
      `);
      
      tableDetails.push({
        name: tableName,
        columns: columnsResult.rows,
        sampleData: sampleDataResult.rows
      });
    }

    return NextResponse.json({ 
      success: true, 
      tables: tableDetails 
    });
  } catch (error: any) {
    console.error('Database exploration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to explore database' 
      }, 
      { status: 500 }
    );
  }
}