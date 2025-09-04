import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import LoginPage from './components/LoginPage';
import { useAuth } from './context/AuthContext';
import api from './api';

function App() {
  const { token } = useAuth();
  const [conversations, setConversations] = useState([]);

  // --- THIS IS THE FIX ---

  // 1. Initialize state from localStorage, defaulting to null if it doesn't exist.
  const [activeConversationId, setActiveConversationId] = useState(
    () => localStorage.getItem('activeConversationId') || null
  );

  // 2. Save the active ID to localStorage whenever it changes.
  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem('activeConversationId', activeConversationId);
    } else {
      // If we are in a "New Chat" state (ID is null), remove it from storage.
      localStorage.removeItem('activeConversationId');
    }
  }, [activeConversationId]);

  // --- END FIX ---

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchConversations();
    }
  }, [token]);

  if (!token) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-white font-sans">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
      />
      <ChatWindow
        // Use a `key` prop to force the ChatWindow to remount when starting a new chat
        key={activeConversationId || 'new'}
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
        onNewConversation={fetchConversations}
      />
    </div>
  );
}

export default App;