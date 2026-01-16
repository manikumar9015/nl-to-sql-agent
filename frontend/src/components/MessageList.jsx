import React from 'react';
import ChatMessage from './ChatMessage';
import { Loader } from 'lucide-react';

const MessageList = ({ messages, isLoading }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, index) => (
        <ChatMessage key={index} message={msg} />
      ))}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader className="w-5 h-5 animate-spin" />
          <span>Thinking...</span>
        </div>
      )}
    </div>
  );
};

export default MessageList;
