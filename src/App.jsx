import { useState } from 'react';
import Login from './components/Login';
import ChatLayout from './components/ChatLayout';
import './App.css';

function App() {
  const [username, setUsername] = useState(null);

  if (!username) {
    return <Login onLogin={setUsername} />;
  }

  return <ChatLayout username={username} />;
}

export default App;
