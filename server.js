// server.js
//
// This is the "brain" of the chat app. It does two jobs:
//  1. Serves the web page (the files in the /public folder) to anyone who visits.
//  2. Keeps a live WebSocket connection open with every connected phone/browser,
//     so messages can be pushed out instantly without anyone hitting "refresh".
const express = require('express');
const http = require('http');
const path = require('path');
const { WebSocketServer } = require('ws');
const pool = require('./db/pool');
const initDB = require('./db/init');
const cronRoutes = require('./routes/cron');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Serve everything inside the "public" folder (the HTML/CSS/JS the phone loads)
app.use(express.static(path.join(__dirname, 'public')));

// Mount the cron endpoint used for the unread-message email reminder
app.use('/api/cron', cronRoutes);

// Keep track of everyone currently connected, plus their chosen name/role
const clients = new Map(); // ws -> { name, role }

function broadcast(data) {
  const message = JSON.stringify(data);
  for (const client of clients.keys()) {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  }
}

function broadcastUserList() {
  const names = [...clients.values()].map((c) => c.name);
  broadcast({ type: 'users', users: names });
}

wss.on('connection', (ws) => {
  clients.set(ws, { name: 'Anonymous', role: null });

  ws.on('message', (raw) => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      return; // ignore anything that isn't valid JSON
    }

    if (data.type === 'join') {
      // Person picked a fixed identity when they opened the app
      const name = (data.name || 'Anonymous').slice(0, 24);
      const role = data.role === 'vincent' || data.role === 'emily' ? data.role : null;
      clients.set(ws, { name, role });
      broadcast({ type: 'system', text: `${name} joined the chat` });
      broadcastUserList();
      return;
    }

    if (data.type === 'message') {
      const sender = clients.get(ws) || { name: 'Anonymous', role: null };
      const text = (data.text || '').slice(0, 1000);
      if (!text.trim()) return;

      const payload = {
        type: 'message',
        name: sender.name,
        role: sender.role,
        text,
        time: Date.now(),
      };
      broadcast(payload);

      // Persist the message so the offline-reminder cron job can see it
      if (sender.role) {
        pool.query(
          `INSERT INTO messages (sender_role, sender_name, text) VALUES ($1, $2, $3)`,
          [sender.role, sender.name, text]
        ).catch((err) => console.error('保存消息失败:', err));
      }
    }
  });

  ws.on('close', () => {
    const info = clients.get(ws);
    clients.delete(ws);
    if (info) {
      broadcast({ type: 'system', text: `${info.name} left the chat` });
      broadcastUserList();
    }
  });
});

const PORT = process.env.PORT || 3000;

initDB()
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Chat server running:`);
      console.log(`  On this computer:  http://localhost:${PORT}`);
      console.log(`  On your phone (same WiFi): http://<your-computer's-local-IP>:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('数据库初始化失败,服务器未启动:', err);
    process.exit(1);
  });
