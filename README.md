# Chat App

A one-to-one real-time messaging app built with React and Socket.IO.

## Tech Stack

- **Frontend**: React 19 + Vite
- **Backend**: Express + Socket.IO (Node.js)
- **Styling**: Plain CSS
- **Deployment**: Vercel (frontend) + Fly.io (backend)

Messages are stored in-memory (prototype). No authentication — users identify by username.

## Project Structure

```
chat-app/
├── server.js                   # Express + Socket.IO backend
├── src/
│   ├── App.jsx                 # Login vs chat routing
│   ├── components/
│   │   ├── Login.jsx           # Username entry screen
│   │   ├── ChatLayout.jsx      # Sidebar + chat area layout
│   │   ├── UserList.jsx        # Online users sidebar
│   │   └── ChatWindow.jsx      # Messages + input
│   └── hooks/
│       └── useSocket.js        # Socket.IO connection & subscriptions
├── Dockerfile                  # Backend container for Fly.io
├── fly.toml                    # Fly.io config
└── vercel.json                 # Vercel SPA fallback
```

## Local Development

Run two terminals:

```bash
# Terminal 1 — backend (port 3002)
npm run server

# Terminal 2 — frontend (port 5173)
npm run dev
```

Open two browser tabs with different usernames to test real-time messaging.

## Deployment

### Backend → Fly.io

```bash
fly auth login
fly launch
fly secrets set CORS_ORIGIN=https://your-app.vercel.app
fly deploy
```

### Frontend → Vercel

Set the environment variable in Vercel dashboard:

```
VITE_SERVER_URL=https://your-app.fly.dev
```

Then deploy:

```bash
vercel
```

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_SERVER_URL` | Vercel (frontend) | Backend URL (default: `http://localhost:3002`) |
| `CORS_ORIGIN` | Fly.io (backend) | Allowed frontend origins, comma-separated |
| `PORT` | Fly.io (backend) | Server port (default: `3002`) |

## How It Works

1. User enters a username on the login screen
2. Frontend connects to the Socket.IO server and registers the user
3. Server broadcasts the online user list via presence events
4. Clicking a user opens a chat — message history loads via REST (`GET /api/messages`)
5. Sending a message emits a Socket.IO event — server stores it and relays to the recipient
6. Messages appear in real-time for both sender and receiver
