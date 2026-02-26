import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'sales_crm',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export async function query(sql, params) {
    const [results] = await pool.execute(sql, params);
    return results;
}

export default pool;
