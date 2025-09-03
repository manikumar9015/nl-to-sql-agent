import React from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ input, setInput, handleSendMessage, isLoading }) => {
  return (
    <footer className="p-4 md:p-6 border-t border-zinc-200 flex-shrink-0">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSendMessage} className="flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your data..."
            className="flex-1 p-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="p-3 bg-black text-white rounded-lg disabled:bg-zinc-200"
            disabled={isLoading}
          >
            <Send size={24} />
          </button>
        </form>
      </div>
    </footer>
  );
};

export default ChatInput;