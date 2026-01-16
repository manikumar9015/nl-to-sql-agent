import React, { useState } from 'react';
import { PlusSquare, MessageSquare, LogOut, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import ConfirmDialog from './ConfirmDialog';

const Sidebar = ({ conversations, activeConversationId, setActiveConversationId, onConversationDeleted }) => {
  const { logout } = useAuth();
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  const handleDeleteClick = (e, conversationId) => {
    e.stopPropagation();
    setConversationToDelete(conversationId);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!conversationToDelete) return;

    setShowConfirm(false);
    setDeletingId(conversationToDelete);
    
    try {
      await api.delete(`/conversations/${conversationToDelete}`);
      
      // If we deleted the active conversation, clear it
      if (activeConversationId === conversationToDelete) {
        setActiveConversationId(null);
      }
      
      // Notify parent to refresh the conversation list
      if (onConversationDeleted) {
        onConversationDeleted();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    } finally {
      setDeletingId(null);
      setConversationToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setConversationToDelete(null);
  };

  return (
    <aside className="w-full flex-shrink-0 bg-zinc-200 dark:bg-[#1E1F20] p-4 flex flex-col h-full transition-colors duration-200">
      <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar">
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 p-3 rounded-md font-semibold text-black dark:text-[#E3E3E3] hover:bg-white dark:hover:bg-[#28292A] w-full transition-colors"
        >
          <PlusSquare size={20} />
          New Chat
        </button>
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-black dark:text-[#E3E3E3] mb-2 px-2">Chat History</h2>
          <div className="flex flex-col gap-1">
            {conversations.map((convo) => (
              <div
                key={convo._id}
                onClick={() => setActiveConversationId(convo._id)}
                className={`group flex items-center gap-2 p-2 rounded-md text-black dark:text-[#E3E3E3] cursor-pointer relative transition-colors ${
                  activeConversationId === convo._id ? 'bg-white dark:bg-[#28292A] font-semibold' : 'hover:bg-white dark:hover:bg-[#28292A]'
                }`}
                title={convo.title}
              >
                <MessageSquare size={16} className="flex-shrink-0 text-zinc-600 dark:text-[#C4C7C5]" />
                <span className="truncate flex-1">{convo.title}</span>
                
                {/* Delete button - shows on hover */}
                <button
                  onClick={(e) => handleDeleteClick(e, convo._id)}
                  disabled={deletingId === convo._id}
                  className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all text-gray-600 dark:text-[#C4C7C5] hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                  title="Delete conversation"
                >
                  {deletingId === convo._id ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all shadow-sm bg-white/70 dark:bg-[#28292A] backdrop-blur-md text-gray-700 dark:text-[#E3E3E3] hover:bg-white/90 dark:hover:bg-[#3C4043] w-full mt-4"
      >
        <LogOut size={16} />
        <span className="text-sm font-medium">Log Out</span>
      </button>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Delete Conversation?"
        message="This conversation will be permanently deleted. This action cannot be undone."
      />
    </aside>
  );
};

export default Sidebar;
