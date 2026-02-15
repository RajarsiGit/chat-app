import { useState, useEffect, useCallback } from 'react';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import { useSocket } from '../hooks/useSocket';
import './ChatLayout.css';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080';

export default function ChatLayout({ username }) {
  const { isConnected, onlineUsers, subscribe, sendMessage } = useSocket(username);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);

  // Load message history when active chat changes
  useEffect(() => {
    if (!activeChat) return;

    setMessages([]);

    fetch(`${SERVER_URL}/api/messages?user=${encodeURIComponent(username)}&with=${encodeURIComponent(activeChat)}`)
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []))
      .catch((err) => console.error('Failed to load messages:', err));
  }, [activeChat, username]);

  // Subscribe to real-time messages for the active chat
  useEffect(() => {
    if (!activeChat) return;

    const unsubscribe = subscribe(activeChat, (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.timestamp === msg.timestamp && m.from === msg.from && m.text === msg.text)) {
          return prev;
        }
        return [...prev, msg];
      });
    });

    return unsubscribe;
  }, [activeChat, subscribe]);

  const handleSend = useCallback(
    (text) => {
      if (!activeChat) return;
      sendMessage(activeChat, text);
    },
    [activeChat, sendMessage]
  );

  return (
    <div className="chat-layout">
      <UserList
        users={onlineUsers}
        currentUser={username}
        activeChat={activeChat}
        onSelectUser={setActiveChat}
      />
      <ChatWindow
        currentUser={username}
        chatWith={activeChat}
        messages={messages}
        onSend={handleSend}
      />
      {!isConnected && <div className="connection-banner">Connecting...</div>}
    </div>
  );
}
