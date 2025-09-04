import React from 'react';
import { PlusSquare, MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ conversations, activeConversationId, setActiveConversationId }) => {
  const { logout } = useAuth();

  const handleNewChat = () => {
    setActiveConversationId(null); // Setting to null signifies a new chat
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-zinc-200 p-4 flex flex-col justify-between">
      <div>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 p-3 rounded-md font-semibold text-black hover:bg-white w-full"
        >
          <PlusSquare size={20} />
          New Chat
        </button>
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-black mb-2 px-2">Chat History</h2>
          <div className="flex flex-col gap-1">
            {conversations.map((convo) => (
              <div
                key={convo._id}
                onClick={() => setActiveConversationId(convo._id)}
                className={`flex items-center gap-2 p-2 rounded-md text-black cursor-pointer truncate ${
                  activeConversationId === convo._id ? 'bg-white font-semibold' : 'hover:bg-white'
                }`}
                title={convo.title}
              >
                <MessageSquare size={16} />
                <span className="truncate">{convo.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-2 p-3 rounded-md font-semibold text-black hover:bg-white w-full"
        >
            <LogOut size={20} />
            Log Out
        </button>
    </aside>
  );
};

export default Sidebar;