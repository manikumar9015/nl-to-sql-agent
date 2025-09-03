import React from 'react';
import { PlusSquare, MessageSquare } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-64 flex-shrink-0 bg-zinc-200 p-4 flex flex-col">
      <button className="flex items-center gap-2 p-3 rounded-md font-semibold text-black hover:bg-white w-full">
        <PlusSquare size={20} />
        New Chat
      </button>
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-black mb-2">Chat History</h2>
        {/* Placeholder for chat history items */}
        <div className="flex items-center gap-2 p-2 rounded-md text-black hover:bg-white cursor-pointer">
            <MessageSquare size={16} />
            <span className="truncate">Initial Sales Analysis</span>
        </div>
         <div className="flex items-center gap-2 p-2 rounded-md text-black hover:bg-white cursor-pointer">
            <MessageSquare size={16} />
            <span className="truncate">Customer breakdown Q3</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;