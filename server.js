import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const io = new Server(httpServer, {
  cors: { origin: CORS_ORIGIN.split(',') },
});

app.use(cors({ origin: CORS_ORIGIN.split(',') }));
app.use(express.json());

// In-memory store
const onlineUsers = new Map(); // socketId -> username
const messages = []; // { from, to, text, timestamp }

function getChannelName(user1, user2) {
  return `chat:${[user1, user2].sort().join(':')}`;
}

// REST: get message history
app.get('/api/messages', (req, res) => {
  const { user, with: withUser } = req.query;
  if (!user || !withUser) {
    return res.status(400).json({ error: 'user and with query params required' });
  }
  const history = messages.filter(
    (m) =>
      (m.from === user && m.to === withUser) ||
      (m.from === withUser && m.to === user)
  );
  res.json({ messages: history });
});

// Socket.IO
io.on('connection', (socket) => {
  let username = null;

  socket.on('register', (name) => {
    username = name;
    onlineUsers.set(socket.id, username);
    // Broadcast updated user list to everyone
    io.emit('users', getOnlineUserList());
  });

  socket.on('send-message', ({ to, text }) => {
    if (!username) return;
    const message = { from: username, to, text, timestamp: Date.now() };
    messages.push(message);

    const channel = getChannelName(username, to);

    // Send to all sockets of the recipient in this channel
    for (const [sid, uname] of onlineUsers) {
      if (uname === to || uname === username) {
        io.to(sid).emit('new-message', { channel, message });
      }
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    io.emit('users', getOnlineUserList());
  });
});

function getOnlineUserList() {
  return [...new Set(onlineUsers.values())];
}

const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
