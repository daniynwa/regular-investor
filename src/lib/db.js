import mysql from 'mysql2/promise';

// Connection pool — reused across requests
let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host:     import.meta.env.DB_HOST     || 'localhost',
      port:     Number(import.meta.env.DB_PORT) || 3306,
      user:     import.meta.env.DB_USER     || 'ri_user',
      password: import.meta.env.DB_PASSWORD || '',
      database: import.meta.env.DB_NAME     || 'regular_investor',
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
