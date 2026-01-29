import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_medical_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
let pool: mysql.Pool | null = null;

export const getPool = (): mysql.Pool => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await getPool().getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Execute query helper
// Uses pool.query() instead of pool.execute() to avoid mysql2 prepared statement
// issues with LIMIT/OFFSET parameters
export const executeQuery = async (
  query: string,
  params: any[] = []
): Promise<any> => {
  try {
    const [results] = await getPool().query(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export default getPool;
