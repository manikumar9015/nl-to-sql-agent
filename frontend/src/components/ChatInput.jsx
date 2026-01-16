import React from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ input, setInput, handleSendMessage, isLoading }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t border-gray-300 dark:border-[#28292A] p-4 bg-white dark:bg-[#131314] transition-colors duration-200">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about your data..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-[#28292A] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-[#28292A] bg-white dark:bg-[#1E1F20] text-black dark:text-[#E3E3E3] placeholder-gray-500 dark:placeholder-[#C4C7C5]"
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-black dark:bg-[#A8C7FA] text-white dark:text-[#131314] rounded-md hover:bg-zinc-800 dark:hover:bg-[#8AB4F8] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
