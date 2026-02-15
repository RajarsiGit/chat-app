# Chat App

## Architecture

Split deployment: React frontend (Vercel) + Express/Socket.IO backend (Fly.io).

- `server.js` — the entire backend: Express REST + Socket.IO in one file
- `src/` — React frontend, no router (state-based login → chat transition)
- Messages stored in-memory (resets on server restart)

## Key Files

- `server.js` — backend entry point, handles socket events (`register`, `send-message`, `disconnect`) and REST endpoint (`GET /api/messages`)
- `src/hooks/useSocket.js` — Socket.IO client hook, manages connection, presence, and message subscriptions
- `src/components/ChatLayout.jsx` — main orchestrator, wires together UserList + ChatWindow + useSocket

## Conventions

- Plain CSS (one `.css` file per component, co-located)
- ES modules throughout (`"type": "module"` in package.json)
- Server URL configured via `VITE_SERVER_URL` env var (frontend) and `CORS_ORIGIN` (backend)
- No authentication — username is just a string passed at login

## Running Locally

```bash
npm run server   # backend on port 3002
npm run dev      # frontend on port 5173
```

## Common Pitfalls

- `server.js` uses ESM imports (not `require`) because of `"type": "module"`
- Socket.IO CORS must include the frontend origin — update `CORS_ORIGIN` env var
- The Dockerfile only copies `server.js` and `package.json` (frontend is deployed separately)
