import { useState, useEffect } from 'react';
import api from '../../api';

/**
 * Custom hook for chat messages and SSE connection management
 * @param {object} params - Hook parameters
 * @returns {object} - Chat state and handlers
 */
const useChatMessages = ({
  activeConversationId,
  setActiveConversationId,
  onNewConversation,
  selectedDb,
  schemaMode,
  handleSchemaMessage,
  setSchemaMode,
  restoreSchemaFromMessages,
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastDataResult, setLastDataResult] = useState(null);
  const [isDbLocked, setIsDbLocked] = useState(false);

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
        const loadedMessages = response.data.messages || [];
        setMessages(loadedMessages);
        setIsDbLocked(true); // Existing conversations have a locked DB

        // Check if this is a schema design conversation
        if (response.data.selectedDatabase === '__schema_design__') {
          console.log('Loading schema design conversation - enabling schema mode');
          setSchemaMode(true);
          restoreSchemaFromMessages(loadedMessages);
        }

        // Restore lastDataResult from the most recent query
        const messagesWithData = loadedMessages
          .filter(msg => msg.sender === 'bot' && msg.executionMetadata)
          .reverse(); // Most recent first

        if (messagesWithData.length > 0) {
          const lastMessage = messagesWithData[0];
          setLastDataResult({
            executionMetadata: lastMessage.executionMetadata,
            maskedSample: lastMessage.maskedSample,
          });
          console.log('[CHAT WINDOW] Restored lastDataResult from conversation history');
        } else {
          setLastDataResult(null);
        }
      } catch (error) {
        console.error("Failed to load conversation:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadConversation();
  }, [activeConversationId]);

  // Effect for Auto-Titling
  useEffect(() => {
    const autoTitleConversation = async () => {
      if (messages.length >= 2 && activeConversationId) {
        try {
          await api.put(`/conversations/${activeConversationId}/title`);
          console.log("Auto-titled conversation successfully.");
          onNewConversation();
        } catch (error) {
          console.log(
            "Auto-titling skipped or failed:",
            error.response?.data?.error
          );
        }
      }
    };
    autoTitleConversation();
  }, [messages, activeConversationId, onNewConversation]);

  const handleSendMessage = async () => {
    // Route to schema handler if in schema mode
    if (schemaMode) {
      handleSchemaMessage(input, setInput, setIsLoading, activeConversationId, setIsDbLocked);
      return;
    }
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    // Add thinking message placeholder
    const thinkingId = Date.now();
    const thinkingMessage = {
      id: thinkingId,
      sender: "bot",
      isThinking: true,
      steps: [],
    };
    setMessages((prev) => [...prev, thinkingMessage]);

    try {
      // Use SSE for streaming thinking steps
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        prompt: currentInput,
        dbName: selectedDb,
        conversationId: activeConversationId || '',
        conversationHistory: JSON.stringify(messages.slice(-10)),
        lastResult: lastDataResult ? JSON.stringify(lastDataResult) : '',
      });

      const eventSource = new EventSource(
        `http://localhost:3001/api/agent/chat-stream?${params.toString()}&token=${token}`
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'thinking') {
          // Update thinking steps
          setMessages((prev) => {
            const updated = [...prev];
            const thinkingIdx = updated.findIndex(msg => msg.id === thinkingId);
            if (thinkingIdx !== -1) {
              updated[thinkingIdx].steps.push({
                text: data.step,
              });
            }
            return updated;
          });
        } else if (data.type === 'complete') {
          // Replace thinking with actual response
          const botMessage = { sender: 'bot', ...data.data };
          
          setMessages((prev) => {
            const updated = [...prev];
            const thinkingIdx = updated.findIndex(msg => msg.id === thinkingId);
            if (thinkingIdx !== -1) {
              updated[thinkingIdx] = botMessage;
            }
            return updated;
          });

          // Update lastDataResult if this was a query execution
          if (botMessage.executionMetadata && botMessage.maskedSample) {
            setLastDataResult({
              executionMetadata: botMessage.executionMetadata,
              maskedSample: botMessage.maskedSample,
            });
          }

          // If this was a new conversation, update the conversation ID and lock the DB
          if (!activeConversationId && data.data.conversationId) {
            setActiveConversationId(data.data.conversationId);
            setIsDbLocked(true);
            onNewConversation(); // Refresh sidebar
          }
          
          eventSource.close();
          setIsLoading(false);
        } else if (data.type === 'error') {
          // Handle error
          const errorMessage = {
            sender: "bot",
            text: data.error || "An error occurred.",
            isError: true,
          };
          
          setMessages((prev) => {
            const updated = [...prev];
            const thinkingIdx = updated.findIndex(msg => msg.id === thinkingId);
            if (thinkingIdx !== -1) {
              updated[thinkingIdx] = errorMessage;
            }
            return updated;
          });
          
          eventSource.close();
          setIsLoading(false);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        
        const errorMessage = {
          sender: "bot",
          text: "Connection error occurred. Please try again.",
          isError: true,
        };
        
        setMessages((prev) => {
          const updated = [...prev];
          const thinkingIdx = updated.findIndex(msg => msg.id === thinkingId);
          if (thinkingIdx !== -1) {
            updated[thinkingIdx] = errorMessage;
          }
          return updated;
        });
        
        eventSource.close();
        setIsLoading(false);
      };
    } catch (error) {
      console.error("Error setting up SSE:", error);
      
      const errorMessage = {
        sender: "bot",
        text: "Failed to establish connection. Please try again.",
        isError: true,
      };
      
      setMessages((prev) => {
        const updated = [...prev];
        const thinkingIdx = updated.findIndex(msg => msg.id === thinkingId);
        if (thinkingIdx !== -1) {
          updated[thinkingIdx] = errorMessage;
        }
        return updated;
      });
      
      setIsLoading(false);
    }
  };

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    setIsLoading,
    lastDataResult,
    setLastDataResult,
    isDbLocked,
    setIsDbLocked,
    handleSendMessage,
  };
};

export default useChatMessages;
