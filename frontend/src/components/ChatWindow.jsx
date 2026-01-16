import React, { useState, useEffect, useRef } from "react";
import api from "../api";

import Header from "./Header";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import QuerySuggestions from "./QuerySuggestions";
import ThinkingSteps from "./ThinkingSteps";
import SchemaDesigner from "./SchemaDesigner";
import SchemaCreationDialog from "./SchemaCreationDialog";
import SchemaLoadingSkeleton from "./SchemaLoadingSkeleton";

const ChatWindow = ({
  activeConversationId,
  setActiveConversationId,
  onNewConversation,
  isSidebarOpen,
  toggleSidebar,
}) => {
  const [selectedDb, setSelectedDb] = useState("sales_db");
  const [isDbLocked, setIsDbLocked] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastDataResult, setLastDataResult] = useState(null);
  const [suggestions, setSuggestions] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // Schema Designer Mode States
  const [schemaMode, setSchemaMode] = useState(false);
  const [currentSchema, setCurrentSchema] = useState(null);
  const [schemaHistory, setSchemaHistory] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [schemaComplete, setSchemaComplete] = useState(false);
  
  // Ref to Header for triggering database refresh
  const headerRef = useRef(null);
  
  // Initialize suggestions toggle from localStorage
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(() => {
    const saved = localStorage.getItem('suggestionsEnabled');
    return saved !== null ? JSON.parse(saved) : true; // Default to enabled
  });

  // Persist suggestions toggle to localStorage
  useEffect(() => {
    localStorage.setItem('suggestionsEnabled', JSON.stringify(suggestionsEnabled));
  }, [suggestionsEnabled]);

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
        setSelectedDb(response.data.selectedDatabase);
        setIsDbLocked(true); // Existing conversations have a locked DB

        // Check if this is a schema design conversation
        if (response.data.selectedDatabase === '__schema_design__') {
         console.log('Loading schema design conversation - enabling schema mode');
          setSchemaMode(true);
          
          // Try to restore the most recent schema from messages
          const messagesWithSchema = loadedMessages
            .filter(msg => msg.sender === 'bot' && msg.schema)
            .reverse(); // Most recent first
          
          if (messagesWithSchema.length > 0) {
            const lastSchema = messagesWithSchema[0].schema;
            setCurrentSchema(lastSchema);
            console.log('Restored schema with', lastSchema.tables?.length, 'tables');
          }
        }

        // === FIX: Restore lastDataResult from the most recent query ===
        // This ensures refinement and result interpretation work after reloading a conversation
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
        // === END FIX ===
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
      // Auto-generate title after 2 messages
      if (messages.length >= 2 && activeConversationId) {
        try {
          // Attempt to update the title. The backend will reject if already titled.
          await api.put(`/conversations/${activeConversationId}/title`);
          console.log("Auto-titled conversation successfully.");
          // Refresh conversation list so the title shows up in the sidebar immediately
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

  // --- NEW: Fetch Suggestions ---
  const fetchSuggestions = async () => {
    if (!selectedDb || !suggestionsEnabled) return; // Skip if disabled

    setLoadingSuggestions(true);
    try {
      const response = await api.get('/agent/suggestions/all', {
        params: {
          dbName: selectedDb,
          conversationId: activeConversationId,
        },
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions({});
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Fetch on database change or on component mount
  useEffect(() => {
    fetchSuggestions();
  }, [selectedDb, activeConversationId, suggestionsEnabled]);

  const handleSelectSuggestion = (suggestion) => {
    setInput(suggestion);
  };
  // --- END NEW FEATURES ---

  // --- SCHEMA MODE FUNCTIONS ---
  const toggleSchemaMode = () => {
    const newMode = !schemaMode;
    setSchemaMode(newMode);
    
    if (newMode) {
      // Entering schema mode - always start fresh
      console.log('Entering schema mode');
      setMessages([{
        sender: "bot",
        text: "🗄️ **Schema Designer Mode**\n\nI'll help you design a database schema. Tell me what kind of application or system you're building, and I'll suggest an appropriate database structure.\n\nFor example:\n- 'I need a library management system'\n- 'Create a blog platform database'\n- 'I want to track customer orders'",
      }]);
      setCurrentSchema(null);
      setSchemaHistory([]);
      setSchemaComplete(false);
      setIsDbLocked(true); // Lock DB in schema mode
      // Start a new conversation by clearing the ID
      setActiveConversationId(null);
    } else {
      // Exiting schema mode
      console.log('Exiting schema mode');
      setMessages([{
        sender: "bot",
        text: "Hello! Please select a database and ask a question to get started.",
      }]);
      setCurrentSchema(null);
      setSchemaHistory([]);
      setSchemaComplete(false);
      setIsDbLocked(false);
      // Clear active conversation to start fresh
      setActiveConversationId(null);
    }
  };

  const handleSchemaMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post('/schema/design', {
        message: currentInput,
        currentSchema,
        conversationHistory: schemaHistory,
      });

      const { schema, explanation, isComplete, needsClarification, suggestions: schemaSuggestions, visualization } = response.data;
      
      console.log('Schema response received:', { hasSchema: !!schema, isComplete, tablesCount: schema?.tables?.length });
      
      // Update schema state
      if (schema) {
        setCurrentSchema(schema);
        console.log('Updated currentSchema with', schema.tables?.length, 'tables');
      }
      setSchemaComplete(isComplete);
      
      // Add to history
      setSchemaHistory(prev => [
        ...prev,
        { role: 'user', content: currentInput },
        { role: 'assistant', content: explanation },
      ]);
      
      // Build bot response
      let botText = explanation;
      
      if (needsClarification) {
        botText += `\n\n**Need clarification:** ${needsClarification}`;
      }
      
      if (schemaSuggestions && schemaSuggestions.length > 0) {
        botText += `\n\n**Suggestions:**\n${schemaSuggestions.map(s => `• ${s}`).join('\n')}`;
      }
      
      if (isComplete) {
        botText += `\n\n✅ **Schema is ready!** Click the "Create Database" button above to finalize.`;
      }
      
      const botMessage = {
        sender: "bot",
        text: botText,
        schema: schema,
        visualization,
      };
      
      setMessages((prev) => [...prev, botMessage]);
      
      // Save to conversation (create new if needed)
      try {
        console.log('Saving schema conversation...', { activeConversationId, messageCount: messages.length + 2 });
        if (!activeConversationId) {
          // Create new conversation with special database marker for schema design
          console.log('Creating new schema conversation');
          const convResponse = await api.post('/conversations', {
            selectedDatabase: '__schema_design__',  // Special marker
            messages: [...messages, userMessage, botMessage],
          });
          console.log('Conversation created:', convResponse.data._id);
          setActiveConversationId(convResponse.data._id);
          setIsDbLocked(true);
          onNewConversation(); // Refresh sidebar
        } else {
          // Update existing conversation
          console.log('Updating existing conversation:', activeConversationId);
          await api.put(`/conversations/${activeConversationId}`, {
            messages: [...messages, userMessage, botMessage],
          });
          console.log('Conversation updated');
        }
      } catch (saveError) {
        console.error('Failed to save schema conversation:', saveError);
        // Don't fail the whole operation if save fails
      }
      
    } catch (error) {
      console.error("Schema design error:", error);
      const errorMessage = {
        sender: "bot",
        text: `Error: ${error.response?.data?.message || error.message || 'Failed to process schema request'}`,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDatabase = async (dbName) => {
    try {
      const response = await api.post('/schema/create', {
        dbName,
        schema: currentSchema,
      });
      
      // Success!
      setShowCreateDialog(false);
      
      const successMessage = {
        sender: "bot",
        text: `🎉 **Success!** Database "${dbName}" has been created with ${response.data.tablesCreated} tables.\n\nYou can now select it from the database dropdown and start querying!`,
      };
      
      setMessages((prev) => [...prev, successMessage]);
      
      setSchemaMode(false);
      setCurrentSchema(null);
      setSchemaHistory([]);
      setSchemaComplete(false);
      
      // Optionally refresh the conversation list
      onNewConversation();
      
      // Trigger database dropdown refresh
      if (headerRef.current?.refreshDatabases) {
        headerRef.current.refreshDatabases();
      }
      
    } catch (error) {
      console.error("Database creation error:", error);
      throw new Error(error.response?.data?.message || 'Failed to create database');
    }
  };
  // --- END SCHEMA MODE FUNCTIONS ---

  const handleSendMessage = async () => {
    // Route to schema handler if in schema mode
    if (schemaMode) {
      handleSchemaMessage();
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
      const token = localStorage.getItem('authToken'); // Fixed: was 'token'
      const params = new URLSearchParams({
        prompt: currentInput,
        dbName: selectedDb,
        conversationId: activeConversationId || '',
        conversationHistory: JSON.stringify(messages.slice(-10)), // Last 10 messages for context
        lastResult: lastDataResult ? JSON.stringify(lastDataResult) : '',
      });

      // Fixed: Remove /api prefix since baseURL already includes it
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

          // Refresh suggestions after successful query
          fetchSuggestions();
          
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

  // --- Resizable Panel Logic ---
  const [panelWidth, setPanelWidth] = useState(50); // percentage for chat panel
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  const startResizing = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Clamp between 20% and 80%
      if (newWidth >= 20 && newWidth <= 80) {
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);
  // --- END Resizable Panel Logic ---

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#131314] flex-1 transition-colors duration-200">
      <Header
        ref={headerRef}
        selectedDb={selectedDb}
        setSelectedDb={setSelectedDb}
        isLocked={isDbLocked || schemaMode}
        suggestionsEnabled={suggestionsEnabled}
        setSuggestionsEnabled={setSuggestionsEnabled}
        schemaMode={schemaMode}
        toggleSchemaMode={toggleSchemaMode}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      
      {/* Main Content Area - Side by Side in Schema Mode */}
      <div 
        ref={containerRef}
        className={`flex flex-1 overflow-hidden ${schemaMode ? 'flex-row' : 'flex-col'}`}
      >
        
        {/* Chat Area */}
        <div 
          className="flex flex-col h-full transition-all duration-75 ease-out"
          style={{ width: schemaMode && currentSchema ? `${panelWidth}%` : '100%' }}
        >
          {/* Messages - scrollable */}
          <div className="flex-1 overflow-y-auto">
            <MessageList messages={messages} isLoading={isLoading} />
          </div>
          
          {/* Suggestions - above input */}
          {suggestionsEnabled && !schemaMode && (
            <div className="border-t border-gray-200 max-h-60 overflow-y-auto bg-gray-50 flex-shrink-0">
              <QuerySuggestions
                suggestions={suggestions}
                onSelectSuggestion={handleSelectSuggestion}
                onRefresh={fetchSuggestions}
                isLoading={loadingSuggestions}
              />
            </div>
          )}
          
          {/* Input - sticky at bottom */}
          <div className="flex-shrink-0">
            <ChatInput
              input={input}
              setInput={setInput}
              handleSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Drag Handle */}
        {schemaMode && (currentSchema || isLoading) && (
          <div
            className={`w-1 bg-zinc-200 dark:bg-[#28292A] hover:bg-blue-400 dark:hover:bg-blue-600 cursor-col-resize flex items-center justify-center transition-colors z-10 ${isResizing ? 'bg-blue-500 dark:bg-blue-600' : ''}`}
            onMouseDown={startResizing}
          >
            {/* Optional: Grip dots for visual affordance */}
            <div className="h-8 w-0.5 bg-zinc-400 dark:bg-[#C4C7C5] rounded-full opacity-50"></div>
          </div>
        )}

        {/* Schema Designer Panel - Side by Side */}
        {schemaMode && (currentSchema || isLoading) && (
          <div 
            className="flex flex-col bg-zinc-50 dark:bg-[#1E1F20] border-l border-zinc-200 dark:border-[#28292A]"
            style={{ width: `${100 - panelWidth}%` }}
          >
            {/* Sticky Header */}
            <div className="border-b border-zinc-200 dark:border-[#28292A] bg-white dark:bg-[#131314] p-4 flex items-center justify-between flex-shrink-0">
              <h3 className="font-semibold text-zinc-900 dark:text-[#E3E3E3] flex items-center gap-2">
                <span className="w-1 h-4 bg-zinc-900 dark:bg-[#E3E3E3] rounded-full"></span>
                Current Schema
              </h3>
              {schemaComplete && !isLoading && (
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="px-4 py-2 bg-black dark:bg-[#A8C7FA] text-white dark:text-[#131314] rounded-lg hover:bg-zinc-800 dark:hover:bg-[#8AB4F8] transition-all font-medium text-sm shadow-sm hover:shadow flex items-center gap-2"
                >
                  <span>🗄️</span> Create Database
                </button>
              )}
            </div>
            {/* Scrollable Schema Content */}
            <div className="flex-1 overflow-y-auto p-4 scollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-[#28292A] hover:scrollbar-thumb-zinc-300 dark:hover:scrollbar-thumb-[#3C4043]">
              {isLoading && !currentSchema ? (
                <SchemaLoadingSkeleton />
              ) : (
                <SchemaDesigner schema={currentSchema} />
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Schema Creation Dialog */}
      {showCreateDialog && currentSchema && (
        <SchemaCreationDialog
          schema={currentSchema}
          onClose={() => setShowCreateDialog(false)}
          onConfirm={handleCreateDatabase}
        />
      )}
    </div>
  );
};

export default ChatWindow;
