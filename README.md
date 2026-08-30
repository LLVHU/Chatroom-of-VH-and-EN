# Pocket Chat

A simple real-time group chat you can open right in your phone's browser. No app store, no account — just a link.

## How it works (in plain terms)

- **server.js** is a small program that runs on a computer. It hands out the webpage and relays messages between everyone connected, instantly, using something called a WebSocket (think of it as a phone line that stays open, instead of everyone constantly hitting refresh).
- **public/index.html** is the actual page your phone loads — the chat bubbles, the input box, all of it.

## Step 1 — Install Node.js (one-time setup)

Node.js is the program that runs server.js. If you don't have it yet:
1. Go to https://nodejs.org
2. Download and install the "LTS" version for your operating system.
3. To check it worked, open a terminal (Terminal on Mac, Command Prompt/PowerShell on Windows) and type:
   ```
   node -v
   ```
   You should see a version number like `v20.x.x`.

## Step 2 — Install the app's dependencies

In your terminal, navigate into this project folder, then run:
```
npm install
```
This downloads the two small libraries the server needs (Express and ws) into a `node_modules` folder.

## Step 3 — Start the server

```
npm start
```
You should see something like:
```
Chat server running:
  On this computer:  http://localhost:3000
  On your phone (same WiFi): http://<your-computer's-local-IP>:3000
```

## Step 4 — Open it on your computer first

Visit `http://localhost:3000` in a browser to confirm it works — pick a name and send a test message.

## Step 5 — Open it on your phone

Your phone needs to be **on the same WiFi network** as the computer running the server. Then:

1. Find your computer's local IP address:
   - **Mac**: System Settings → Wi-Fi → Details (something like `192.168.1.42`)
   - **Windows**: open Command Prompt, type `ipconfig`, look for "IPv4 Address"
2. On your phone's browser, go to `http://<that-IP>:3000` — e.g. `http://192.168.1.42:3000`
3. Pick a name, tap Join, and start chatting. Open the same address on a second device to test the real-time messaging.

## Want it reachable from anywhere (not just home WiFi)?

Right now this only works when devices share the same WiFi network. To make it reachable over the internet from any phone, anywhere, you'd deploy it to a hosting service (e.g. Render, Railway, Fly.io all have free tiers that work well for small Node apps like this). Ask me when you're ready for that step and I'll walk you through it.

## Ideas for what to add next

- Multiple chat rooms/channels instead of one shared room
- Saving message history so it's still there after a restart (currently messages only live in memory while the server is running)
- Private 1-on-1 messages
- Profile pictures or colors per user
