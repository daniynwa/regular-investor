import mysql from 'mysql2/promise';

// Connection pool — reused across requests
let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host:     process.env.DB_HOST     || import.meta.env.DB_HOST     || 'localhost',
      port:     Number(process.env.DB_PORT || import.meta.env.DB_PORT) || 3306,
      user:     process.env.DB_USER     || import.meta.env.DB_USER     || 'ri_user',
      password: process.env.DB_PASSWORD || import.meta.env.DB_PASSWORD || '',
      database: process.env.DB_NAME     || import.meta.env.DB_NAME     || 'regular_investor',
      waitForConnections: true,
      connectionLimit:    10,
      queueLimit:         0,
      timezone: '+07:00',
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows;
}
