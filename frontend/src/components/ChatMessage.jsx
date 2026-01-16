import React, { useState } from 'react';
import { Bot, User, Code } from 'lucide-react';
import SmartVisualizer from './SmartVisualizer';
import SchemaDesigner from './SchemaDesigner';
import MarkdownText from './MarkdownText';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook
import api from '../api';
import ThinkingSteps from './ThinkingSteps';

const ChatMessage = ({ message }) => {
  // Destructure all possible properties from the message object
  const { sender, text, isError, visPackage, maskedSample, executionMetadata, verifier_output, wasRefined, executedSql, isThinking, steps, schema } = message;

  // --- ADD THIS DEBUG LINE ---
  if (visPackage) {
    console.log("--- [DEBUG] DATA RECEIVED BY VISUALIZER ---");
    console.log("MASKED SAMPLE:", maskedSample);
    console.log("VIS PACKAGE:", visPackage);
    console.log("------------------------------------");
  }

  const { user } = useAuth(); // Get the currently logged-in user
  const [showSql, setShowSql] = useState(false); // State to manage the toggle

  const isBot = sender === 'bot';
  const isUser = sender === 'user';


  // If this is a thinking message, render ThinkingSteps
  if (isThinking) {
    return (
      <div className={`flex gap-4 p-4 ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-black dark:bg-[#E3E3E3]' : 'bg-green-600 dark:bg-green-700'
        }`}>
          {isUser ? (
            <User className="w-5 h-5 text-white dark:text-[#131314]" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>
        
        <div className={`flex-1 max-w-[80%] space-y-2 ${isUser ? 'text-right' : ''}`}>
          <div 
            className={`inline-block p-3 rounded-2xl text-left ${
              isUser 
                ? 'bg-zinc-100 dark:bg-[#28292A] text-black dark:text-[#E3E3E3] rounded-tr-none' 
                : 'bg-transparent text-gray-800 dark:text-[#E3E3E3] w-full'
            }`}
          >
            {isUser ? (
              message.text
            ) : (
              <MarkdownText content={message.text} />
            )}

            {/* Thinking Process Accordion */}
            {steps && (
              <div className="mt-4">
                <ThinkingSteps steps={steps} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-4 my-6 ${!isBot ? 'justify-end' : ''}`}>
      {isBot && (
        <div className="w-8 h-8 flex-shrink-0 bg-zinc-200 dark:bg-green-700 rounded-full flex items-center justify-center">
          <Bot size={20} className="text-black dark:text-white" />
        </div>
      )}

      <div className={`p-4 rounded-lg max-w-2xl w-full ${isBot ? 'bg-zinc-200 dark:bg-transparent text-black dark:text-[#E3E3E3]' : 'bg-black dark:bg-[#28292A] text-white dark:text-[#E3E3E3]'} ${isError ? 'bg-red-500 text-white' : ''}`}>
        {/* Show refinement indicator */}
        {wasRefined && (
          <div className="mb-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md inline-block">
            ✨ Query refined
          </div>
        )}
        
        <MarkdownText text={text} variant={isBot ? 'light' : 'dark'} />
        
        {/* The SmartVisualizer for displaying charts and tables */}
        {visPackage && maskedSample && executionMetadata && (
          <div className="mt-4 p-2 bg-white dark:bg-black rounded-md border border-transparent dark:border-zinc-700 overflow-hidden">
            <SmartVisualizer 
              visPackage={visPackage}
              maskedSample={maskedSample}
              executionMetadata={executionMetadata}
            />
          </div>
        )}
        
        {/* --- NEW: ADMIN-ONLY UI SECTION --- */}
        {user?.role === 'admin' && verifier_output && (
          <div className="mt-4 border-t border-zinc-300 pt-3">
            <button
              onClick={() => setShowSql(!showSql)}
              className="flex items-center gap-1 text-xs font-semibold text-black dark:text-gray-400 hover:opacity-75 transition-opacity"
            >
              <Code size={14} />
              {showSql ? 'Hide SQL & Verifier Output' : 'Show SQL & Verifier Output'}
            </button>
            {showSql && (
              <pre className="mt-2 p-2 bg-black text-white text-xs rounded-md overflow-x-auto">
                {JSON.stringify(verifier_output, null, 2)}
              </pre>
            )}
          </div>
        )}
        {/* --- END: ADMIN-ONLY UI SECTION --- */}

        {/* Schema Visualization */}




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