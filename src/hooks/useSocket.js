import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

function getChannelName(user1, user2) {
  return `chat:${[user1, user2].sort().join(':')}`;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080';

export function useSocket(username) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messageHandlerRef = useRef(null);
  const activeChatRef = useRef(null);

  useEffect(() => {
    if (!username) return;

    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('register', username);
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.on('users', (users) => {
      setOnlineUsers(users.filter((u) => u !== username));
    });

    socket.on('new-message', ({ channel, message }) => {
      const activeChannel = activeChatRef.current
        ? getChannelName(username, activeChatRef.current)
        : null;

      if (channel === activeChannel && messageHandlerRef.current) {
        messageHandlerRef.current(message);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [username]);

  const subscribe = useCallback(
    (otherUser, onMessage) => {
      activeChatRef.current = otherUser;
      messageHandlerRef.current = onMessage;

      return () => {
        activeChatRef.current = null;
        messageHandlerRef.current = null;
      };
    },
    []
  );

  const sendMessage = useCallback((to, text) => {
    if (socketRef.current) {
      socketRef.current.emit('send-message', { to, text });
    }
  }, []);

  return { isConnected, onlineUsers, subscribe, sendMessage };
}
