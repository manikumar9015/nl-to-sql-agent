import React from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import LoginPage from './components/LoginPage';
import { useAuth } from './context/AuthContext';

function App() {
  const { token } = useAuth(); // Get the token from our context

  if (!token) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-white font-sans">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}

export default App;