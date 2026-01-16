import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Lightbulb, LightbulbOff, Database, Menu, Sun, Moon } from 'lucide-react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

const Header = forwardRef(({ selectedDb, setSelectedDb, isLocked, suggestionsEnabled, setSuggestionsEnabled, schemaMode, toggleSchemaMode, toggleSidebar, isSidebarOpen }, ref) => {
  const [databases, setDatabases] = useState(['sales_db', 'student_db']); // Default fallback
  const [loadingDatabases, setLoadingDatabases] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Fetch available databases on mount
  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    setLoadingDatabases(true);
    try {
      const response = await api.get('/databases');
      if (response.data && response.data.length > 0) {
        setDatabases(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch databases:', error);
      // Keep default databases on error
    } finally {
      setLoadingDatabases(false);
    }
  };

  // Expose refresh function to parent via ref
  useImperativeHandle(ref, () => ({
    refreshDatabases: fetchDatabases
  }));

  return (
    <header className="bg-white dark:bg-[#131314] border-b border-gray-300 dark:border-[#28292A] py-2.5 px-4 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#28292A] text-zinc-500 dark:text-[#C4C7C5] hover:text-black dark:hover:text-[#E3E3E3] transition-colors"
          title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-xl font-bold flex items-center gap-2 text-black dark:text-[#E3E3E3]">
          QueryCompass
          {schemaMode && (
            <span className="text-sm font-normal px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 rounded-md">
              🗄️ Schema Designer
            </span>
          )}
        </h1>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center p-2 rounded-lg transition-all text-gray-700 dark:text-[#E3E3E3] hover:bg-gray-100 dark:hover:bg-[#28292A]"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Suggestions Toggle */}
        <button
          onClick={() => setSuggestionsEnabled(!suggestionsEnabled)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all shadow-sm ${
            suggestionsEnabled 
              ? 'bg-gray-900/90 dark:bg-[#A8C7FA] backdrop-blur-md text-white dark:text-[#131314] hover:bg-gray-900 dark:hover:bg-[#8AB4F8]'
              : 'bg-white/70 dark:bg-[#28292A] backdrop-blur-md text-gray-700 dark:text-[#E3E3E3] hover:bg-white/90 dark:hover:bg-[#3C4043]'
          }`}
          title={suggestionsEnabled ? 'Disable suggestions' : 'Enable suggestions'}
        >
          {suggestionsEnabled ? (
            <Lightbulb className="w-4 h-4" />
          ) : (
            <LightbulbOff className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">Suggestions</span>
        </button>

        {/* Schema Designer Toggle */}
        <button
          onClick={toggleSchemaMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all shadow-sm ${
            schemaMode 
              ? 'bg-gray-900/90 dark:bg-[#A8C7FA] backdrop-blur-md text-white dark:text-[#131314] hover:bg-gray-900 dark:hover:bg-[#8AB4F8]'
              : 'bg-white/70 dark:bg-[#28292A] backdrop-blur-md text-gray-700 dark:text-[#E3E3E3] hover:bg-white/90 dark:hover:bg-[#3C4043]'
          }`}
          title={schemaMode ? 'Exit schema designer' : 'Enter schema designer'}
        >
          <Database className="w-4 h-4" />
          <span className="text-sm font-medium">Schema Designer</span>
        </button>

        {/* Database Selector - Now Dynamic! */}
        <select
          value={selectedDb}
          onChange={(e) => setSelectedDb(e.target.value)}
          disabled={isLocked || loadingDatabases}
          className="px-4 py-1.5 text-sm font-medium border border-gray-300 dark:border-[#28292A] rounded-md bg-white dark:bg-[#28292A] text-gray-900 dark:text-[#E3E3E3] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {databases.map(db => (
            <option key={db} value={db}>{db}</option>
          ))}
        </select>
        
        {/* Refresh Button */}
        <button
          onClick={fetchDatabases}
          disabled={loadingDatabases}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#28292A] text-gray-500 dark:text-[#C4C7C5] rounded-md transition-colors"
          title="Refresh database list"
        >
          <svg className={`w-4 h-4 ${loadingDatabases ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
