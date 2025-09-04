import React, { useState, useEffect } from "react";
import api from "../api";

import Header from "./Header";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

const ChatWindow = ({
  activeConversationId,
  setActiveConversationId,
  onNewConversation,
}) => {
  const [selectedDb, setSelectedDb] = useState("sales_db");
  const [isDbLocked, setIsDbLocked] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastDataResult, setLastDataResult] = useState(null);

  // Effect to load a conversation when it's selected from the sidebar
  useEffect(() => {
    const loadConversation = async () => {
      if (!activeConversationId) {
        // This is a new chat
        setMessages([
          {
            sender: "bot",
            text: "Hello! Please select a database and ask a question to get started.",
          },
        ]);
        setIsDbLocked(false);
        setLastDataResult(null);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get(
          `/conversations/${activeConversationId}`
        );
        setMessages(response.data.messages || []);
        setSelectedDb(response.data.selectedDatabase);
        setIsDbLocked(true); // Existing conversations have a locked DB
      } catch (error) {
        console.error("Failed to load conversation:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadConversation();
  }, [activeConversationId]);

  // --- NEW: Effect for Auto-Titling ---
  useEffect(() => {
    const autoTitleConversation = async () => {
      // Trigger condition: 10 or more messages and an active conversation ID exists.
      // The backend will check if the title is still "New Chat".
      if (messages.length >= 10 && activeConversationId) {
        try {
          // Attempt to update the title. The backend will reject if already titled.
          await api.put(`/conversations/${activeConversationId}/title`);
          // Refresh the sidebar to show the new title
          onNewConversation();
        } catch (error) {
          // This is not a critical error, so we just log it.
          // It usually just means the title was already set.
          console.log(
            "Auto-titling skipped or failed:",
            error.response?.data?.error
          );
        }
      }
    };

    // Run this check whenever the messages array changes.
    autoTitleConversation();
  }, [messages, activeConversationId, onNewConversation]);
  // --- END NEW EFFECT ---

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "" || isLoading) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;
    setInput("");
    setIsLoading(true);

    const conversationHistory = [...messages, userMessage].slice(-10);

    try {
      const response = await api.post("/agent/chat", {
        conversationId: activeConversationId, // Pass the active ID (can be null)
        prompt: currentInput,
        dbName: selectedDb,
        conversationHistory: conversationHistory,
        lastResult: lastDataResult,
      });

      const botResponse = { sender: "bot", ...response.data };
      setMessages((prev) => [...prev, botResponse]);

      // If this was the first message of a new chat, a new conversation was created.
      if (!activeConversationId && response.data.conversationId) {
        setActiveConversationId(response.data.conversationId);
        onNewConversation(); // Refresh the sidebar
      }

      if (botResponse.executionMetadata) {
        setLastDataResult({
          executionMetadata: botResponse.executionMetadata,
          maskedSample: botResponse.maskedSample,
        });
        setIsDbLocked(true);
      }
    } catch (error) {
      const errorMessage = {
        sender: "bot",
        text: "Sorry, I encountered an error.",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Error fetching response:", error);
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
