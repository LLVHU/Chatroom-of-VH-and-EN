const pool = require('./pool');

async function migrate() {
  try {
    await pool.query('ALTER TABLE messages ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE');
    console.log('迁移成功:messages 表已添加 reminder_sent 字段');
  } catch (err) {
    console.error('迁移失败:', err);
  } finally {
    await pool.end();
  }
}

migrate();
