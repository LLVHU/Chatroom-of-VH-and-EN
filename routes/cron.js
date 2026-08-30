const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { sendUnreadNotification } = require('../utils/mailer');

router.get('/check-unread', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, sender_name, text, created_at
      FROM messages
      WHERE email_notified = FALSE
        AND created_at < NOW() - INTERVAL '20 minutes'
    `);

    const unreadMessages = result.rows;

    for (const msg of unreadMessages) {
      await sendUnreadNotification(msg.sender_name, msg.text);
      await pool.query(
        `UPDATE messages SET email_notified = TRUE WHERE id = $1`,
        [msg.id]
      );
    }

    res.status(200).json({ success: true, remindersSent: unreadMessages.length });
  } catch (err) {
    console.error('check-unread 执行失败:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
