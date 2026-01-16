import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import LoginPage from './components/LoginPage';
import { useAuth } from './context/AuthContext';
import api from './api';

function MainApp() {
  const { token } = useAuth();
  const [conversations, setConversations] = useState([]);

  // Initialize state from localStorage
  const [activeConversationId, setActiveConversationId] = useState(
    () => localStorage.getItem('activeConversationId') || null
  );

  // Save to localStorage when changed
  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem('activeConversationId', activeConversationId);
    } else {
      localStorage.removeItem('activeConversationId');
    }
  }, [activeConversationId]);

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

  // Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ... (fetchConversations logic) ...

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (!token) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#131314] text-zinc-900 dark:text-[#E3E3E3] font-sans transition-colors duration-200">
      {/* Sidebar - Collapsible */}
      <div 
        className={`bg-zinc-100 dark:bg-[#1E1F20] flex flex-col h-screen transition-all duration-300 ease-in-out border-r border-zinc-200 dark:border-[#28292A] overflow-hidden ${
          isSidebarOpen ? 'w-72 opacity-100' : 'w-0 opacity-0'
        }`}
      >
        {/* Sidebar content */}
        <div className="flex-1 overflow-hidden min-w-[18rem]"> {/* min-w prevents content squishing during transition */}
          <Sidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            setActiveConversationId={setActiveConversationId}
            onConversationDeleted={fetchConversations}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-screen overflow-hidden">
        <Routes>
          <Route
            path="/"
            element={
              <ChatWindow
                key={activeConversationId || 'new'}
                activeConversationId={activeConversationId}
                setActiveConversationId={setActiveConversationId}
                onNewConversation={fetchConversations}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
};

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </Router>
  );
}

export default App;
