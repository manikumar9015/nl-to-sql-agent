import React, { useState } from 'react';
import axios from 'axios';

import Header from './Header';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const ChatWindow = () => {
  const [selectedDb, setSelectedDb] = useState('sales_db');
  const [isDbLocked, setIsDbLocked] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! Please select a database and ask a question to get started.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastDataResult, setLastDataResult] = useState(null); // State for the last data result

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;

    const userMessage = { sender: 'user', text: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    const currentInput = input;
    setInput('');
    setIsLoading(true);

    const conversationHistory = updatedMessages.slice(-10);

    try {
      const response = await axios.post('http://localhost:3001/api/agent/chat', {
        prompt: currentInput,
        dbName: selectedDb,
        conversationHistory: conversationHistory,
        lastResult: lastDataResult, // Send the last result with the request
      });

      // Lock the database selector after the first successful message
      if (!isDbLocked && response.data.executionMetadata) {
        setIsDbLocked(true);
      }

      const botResponse = { sender: 'bot', ...response.data };
      setMessages((prev) => [...prev, botResponse]);

      // --- THIS IS THE CRITICAL UPDATE ---
      // If the response was from a data query, store its results for the next turn.
      if (botResponse.executionMetadata && botResponse.maskedSample) {
        setLastDataResult({
          executionMetadata: botResponse.executionMetadata,
          maskedSample: botResponse.maskedSample,
        });
      }
      // ------------------------------------

    } catch (error) {
      const errorMessage = { sender: 'bot', text: 'Sorry, I encountered an error.', isError: true };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Error fetching response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white flex-1">
      <Header 
        selectedDb={selectedDb}
        setSelectedDb={setSelectedDb}
        isLocked={isDbLocked}
      />
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput
        input={input}
        setInput={setInput}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatWindow;