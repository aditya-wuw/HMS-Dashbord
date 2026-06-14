import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true, // Set to true to enforce secure connections
  }
});

pool.on('connect', () => {
  console.log('Connected to Neon PostgreSQL database pool');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err.message);
  process.exit(-1);
});

/**
 * Execute a query against the Neon PostgreSQL database.
 * @param {string} text - The SQL query text.
 * @param {Array} params - The query parameters.
 * @returns {Promise<import('pg').QueryResult>}
 */
export const query = (text, params) => pool.query(text, params);

export default pool;
