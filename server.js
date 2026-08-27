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

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Serve everything inside the "public" folder (the HTML/CSS/JS the phone loads)
app.use(express.static(path.join(__dirname, 'public')));

// Keep track of everyone currently connected, plus their chosen name
const clients = new Map(); // ws -> { name }

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
  clients.set(ws, { name: 'Anonymous' });

  ws.on('message', (raw) => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      return; // ignore anything that isn't valid JSON
    }

    if (data.type === 'join') {
      // Person picked a display name when they opened the app
      const name = (data.name || 'Anonymous').slice(0, 24); // keep names short
      clients.set(ws, { name });
      broadcast({ type: 'system', text: `${name} joined the chat` });
      broadcastUserList();
      return;
    }

    if (data.type === 'message') {
      const sender = clients.get(ws) || { name: 'Anonymous' };
      const text = (data.text || '').slice(0, 1000); // basic length limit
      if (!text.trim()) return;
      broadcast({
        type: 'message',
        name: sender.name,
        text,
        time: Date.now(),
      });
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
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Chat server running:`);
  console.log(`  On this computer:  http://localhost:${PORT}`);
  console.log(`  On your phone (same WiFi): http://<your-computer's-local-IP>:${PORT}`);
});
