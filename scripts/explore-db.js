// Script to explore the database schema and contents
require('dotenv').config({ path: '.env.local' });

const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false // Allow self-signed certificates
  }
});

async function exploreDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Get list of tables
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    const tables = tablesResult.rows;
    console.log(`\nFound ${tables.length} tables in the database:`);
    tables.forEach(table => console.log(`- ${table.table_name}`));
    
    // Explore each table's structure and sample data
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`\n\n=============================================`);
      console.log(`Table: ${tableName}`);
      
      // Get column information
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);
      
      console.log(`\nColumns:`);
      columnsResult.rows.forEach(column => {
        console.log(`- ${column.column_name} (${column.data_type}, nullable: ${column.is_nullable})`);
      });
      
      // Count rows
      const countResult = await pool.query(`SELECT COUNT(*) FROM "${tableName}"`);
      const rowCount = parseInt(countResult.rows[0].count);
      console.log(`\nRow count: ${rowCount}`);
      
      // Get sample data (first 5 rows)
      if (rowCount > 0) {
        const sampleResult = await pool.query(`SELECT * FROM "${tableName}" LIMIT 5`);
        console.log(`\nSample data (first 5 rows):`);
        sampleResult.rows.forEach((row, i) => {
          console.log(`Row ${i + 1}:`, JSON.stringify(row, null, 2));
        });
      }
    }
    
  } catch (error) {
    console.error('Error exploring database:', error);
  } finally {
    await pool.end();
    console.log('\nDatabase connection closed.');
  }
}

exploreDatabase();