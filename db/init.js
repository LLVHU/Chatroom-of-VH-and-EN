const pool = require('./pool');

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      sender_role VARCHAR(20) NOT NULL,
      sender_name VARCHAR(24),
      text TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      email_notified BOOLEAN DEFAULT false
    );
  `);

  console.log('✅ 数据表初始化完成');
}

module.exports = initDB;
