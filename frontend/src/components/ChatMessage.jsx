import React, { useState } from 'react';
import { Bot, User, Code } from 'lucide-react';
import SmartVisualizer from './SmartVisualizer';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

const ChatMessage = ({ message }) => {
  // Destructure all possible properties from the message object
  const { sender, text, isError, visPackage, maskedSample, executionMetadata, verifier_output } = message;

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

  return (
    <div className={`flex items-start gap-4 my-6 ${!isBot ? 'justify-end' : ''}`}>
      {isBot && (
        <div className="w-8 h-8 flex-shrink-0 bg-zinc-200 rounded-full flex items-center justify-center">
          <Bot size={20} className="text-black" />
        </div>
      )}

      <div className={`p-4 rounded-lg max-w-2xl w-full ${isBot ? 'bg-zinc-200 text-black' : 'bg-black text-white'} ${isError ? 'bg-red-500 text-white' : ''}`}>
        <p className="whitespace-pre-wrap">{text}</p>
        
        {/* The SmartVisualizer for displaying charts and tables */}
        {visPackage && maskedSample && executionMetadata && (
          <div className="mt-4 p-2 bg-white rounded-md">
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
              className="flex items-center gap-1 text-xs font-semibold text-black hover:opacity-75"
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