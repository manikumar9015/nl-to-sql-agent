import React from 'react';
import { Bot, User } from 'lucide-react';
import SmartVisualizer from './SmartVisualizer'; // <-- IMPORT

const ChatMessage = ({ message }) => {
  // The full API response is now in the message object
  const { sender, text, isError, visPackage, maskedSample, executionMetadata } = message;

  const isBot = sender === 'bot';

  return (
    <div className={`flex items-start gap-4 my-6 ${!isBot ? 'justify-end' : ''}`}>
      {isBot && (
        <div className="w-8 h-8 flex-shrink-0 bg-zinc-200 rounded-full flex items-center justify-center">
          <Bot size={20} className="text-black" />
        </div>
      )}

      <div className={`p-4 rounded-lg max-w-2xl w-full ${isBot ? 'bg-zinc-200 text-black' : 'bg-black text-white'} ${isError ? 'bg-red-500 text-white' : ''}`}>
        <p className="whitespace-pre-wrap">{text}</p>
        
        {/* --- REPLACE THE PLACEHOLDER --- */}
        {visPackage && maskedSample && executionMetadata && (
          <div className="mt-4 p-2 bg-white rounded-md">
            <SmartVisualizer 
              visPackage={visPackage}
              maskedSample={maskedSample}
              executionMetadata={executionMetadata}
            />
          </div>
        )}
        {/* --- END REPLACEMENT --- */}

      </div>

      {!isBot && (
        <div className="w-8 h-8 flex-shrink-0 bg-black rounded-full flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;