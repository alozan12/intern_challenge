import { Pool } from 'pg';

// Log database connection config (without sensitive data)
console.log('Database configuration:', {
  user: process.env.DB_USER ? '[SET]' : '[NOT SET]',
  host: process.env.DB_HOST ? '[SET]' : '[NOT SET]',
  database: process.env.DB_NAME ? '[SET]' : '[NOT SET]',
  port: process.env.DB_PORT || '5432',
  password: process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]',
  ssl: true
});

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false // Allow self-signed certificates, remove in production
  },
  // Connection timeout after 10 seconds
  connectionTimeoutMillis: 10000,
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database successfully');
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    stack: err.stack
  });
  // Don't exit in development to allow fallback to mock data
  if (process.env.NODE_ENV === 'production') {
    process.exit(-1);
  }
});

// Helper function to execute queries
export async function query(text: string, params?: any[]) {
  try {
    console.log('Executing database query:', { 
      text, 
      params: params ? `[${params.join(', ')}]` : 'none',
      timestamp: new Date().toISOString()
    });
    
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    console.log('Query executed successfully', { 
      text, 
      duration: `${duration}ms`, 
      rows: res.rowCount,
      firstRow: res.rows.length > 0 ? JSON.stringify(res.rows[0]).substring(0, 100) + '...' : 'none'
    });
    
    return res;
  } catch (error: any) {
    console.error('Error executing query:', {
      text,
      params: params ? `[${params.join(', ')}]` : 'none',
      errorName: error.name,
      errorMessage: error.message,
      errorCode: error.code, // PostgreSQL error code
      errorStack: error.stack
    });
    throw error;
  }
}

// Helper function to get a client from the pool
export async function getClient() {
  const client = await pool.connect();
  return client;
}

export default pool;