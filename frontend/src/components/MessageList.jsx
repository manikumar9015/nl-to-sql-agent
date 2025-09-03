import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { Bot, LoaderCircle } from 'lucide-react';

const LoadingIndicator = () => (
  <div className="flex items-start gap-4 my-6">
    <div className="w-8 h-8 flex-shrink-0 bg-zinc-200 rounded-full flex items-center justify-center">
      <Bot size={20} className="text-black" />
    </div>
    <div className="p-4 rounded-lg bg-zinc-200 flex items-center gap-2 text-black">
      <LoaderCircle size={20} className="animate-spin" />
      <span>Thinking...</span>
    </div>
  </div>
);

const MessageList = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </main>
  );
};

export default MessageList;