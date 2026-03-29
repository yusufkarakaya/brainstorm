# Brainstorm

A real-time collaborative brainstorming app. Share a link — everyone with it can add, edit, and move idea cards on a shared canvas simultaneously.

## Features

- **Instant collaboration** — changes appear live for all participants via WebSocket
- **Sticky note canvas** — add colorful cards, drag them anywhere, double-click to edit
- **Shareable sessions** — one URL per session, no login required
- **Persistent** — cards survive page reloads (SQLite)
- **Peer cursors** — see where other collaborators are on the canvas

## Tech Stack

| | |
|---|---|
| Frontend | React + Vite + TypeScript |
| State | Zustand |
| Backend | Node.js + Express + Socket.IO |
| Database | SQLite (`node:sqlite`) |
| Styling | Plain CSS |

## Getting Started

```bash
# Install dependencies
npm install

# Start both client and server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), click **Start New Session**, and share the URL with your collaborators.

## How It Works

1. A new session generates a unique URL (e.g. `/s/V1StGXR8_Z5jdHi6B`)
2. Anyone who visits that URL joins the same Socket.IO room
3. All card operations (create, move, edit, delete) are broadcast in real-time
4. Cards are persisted to a local SQLite database file (`server/data/brainstorm.db`)
