import mysql from 'mysql2/promise';

// Support both DATABASE_URL (cloud providers like PlanetScale, Aiven, Railway)
// and individual DB_* environment variables
function getDbConfig(): mysql.PoolOptions {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    return {
      uri: databaseUrl,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false },
    };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'student_medical_system',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    ssl: process.env.DB_SSL === 'false' ? undefined : process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  };
}

// Create connection pool (singleton for serverless reuse)
let pool: mysql.Pool | null = null;

export const getPool = (): mysql.Pool => {
  if (!pool) {
    pool = mysql.createPool(getDbConfig());
  }
  return pool;
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await getPool().getConnection();
    console.log('Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
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
