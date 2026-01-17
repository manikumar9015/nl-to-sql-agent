import React, { useState, useEffect, useRef } from "react";
import api from "../api";

import Header from "./Header";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import QuerySuggestions from "./QuerySuggestions";
import SchemaCreationDialog from "./SchemaCreationDialog";
import SchemaPanel from "./SchemaPanel";

import useResizablePanel from "./hooks/useResizablePanel";
import useSchemaMode from "./hooks/useSchemaMode";
import useChatMessages from "./hooks/useChatMessages";

const ChatWindow = ({
  activeConversationId,
  setActiveConversationId,
  onNewConversation,
  isSidebarOpen,
  toggleSidebar,
}) => {
  const [selectedDb, setSelectedDb] = useState("sales_db");
  const [suggestions, setSuggestions] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // Ref to Header for triggering database refresh
  const headerRef = useRef(null);
  
  // Initialize suggestions toggle from localStorage
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(() => {
    const saved = localStorage.getItem('suggestionsEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Custom hooks for extracted functionality
  const { panelWidth, isResizing, containerRef, startResizing } = useResizablePanel(50);

  // Schema mode hook (initialized first as it provides setMessages)
  const schemaState = useSchemaMode({
    setMessages: (fn) => chatState.setMessages(fn),
    setActiveConversationId,
    onNewConversation,
    headerRef,
    messages: [],
  });

  // Chat messages hook
  const chatState = useChatMessages({
    activeConversationId,
    setActiveConversationId,
    onNewConversation,
    selectedDb,
    schemaMode: schemaState.schemaMode,
    handleSchemaMessage: schemaState.handleSchemaMessage,
    setSchemaMode: schemaState.setSchemaMode,
    restoreSchemaFromMessages: schemaState.restoreSchemaFromMessages,
  });

  // Re-wire schema mode to use actual messages from chatState
  useEffect(() => {
    // This ensures schema mode operations use the actual messages
  }, [chatState.messages]);

  // Persist suggestions toggle to localStorage
  useEffect(() => {
    localStorage.setItem('suggestionsEnabled', JSON.stringify(suggestionsEnabled));
  }, [suggestionsEnabled]);

  // Fetch Suggestions
  const fetchSuggestions = async () => {
    if (!selectedDb || !suggestionsEnabled) return;

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
    chatState.setInput(suggestion);
  };

  // Custom toggle that also resets chat state
  const handleToggleSchemaMode = () => {
    const newMode = !schemaState.schemaMode;
    schemaState.setSchemaMode(newMode);
    
    if (newMode) {
      chatState.setMessages([{
        sender: "bot",
        text: "🗄️ **Schema Designer Mode**\n\nI'll help you design a database schema. Tell me what kind of application or system you're building, and I'll suggest an appropriate database structure.\n\nFor example:\n- 'I need a library management system'\n- 'Create a blog platform database'\n- 'I want to track customer orders'",
      }]);
      chatState.setIsDbLocked(true);
      setActiveConversationId(null);
    } else {
      chatState.setMessages([{
        sender: "bot",
        text: "Hello! Please select a database and ask a question to get started.",
      }]);
      chatState.setIsDbLocked(false);
      setActiveConversationId(null);
    }
  };

  // Handle schema message with proper state access
  const handleSchemaMessageWrapper = async () => {
    if (!chatState.input.trim()) return;

    const userMessage = { sender: "user", text: chatState.input };
    chatState.setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = chatState.input;
    chatState.setInput("");
    chatState.setIsLoading(true);

    try {
      const response = await api.post('/schema/design', {
        message: currentInput,
        currentSchema: schemaState.currentSchema,
        conversationHistory: schemaState.schemaHistory,
      });

      const { schema, explanation, isComplete, needsClarification, suggestions: schemaSuggestions, visualization } = response.data;
      
      if (schema) {
        schemaState.setCurrentSchema(schema);
      }
      
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
      
      chatState.setMessages((prev) => [...prev, botMessage]);
      
      // Save to conversation
      if (!activeConversationId) {
        const convResponse = await api.post('/conversations', {
          selectedDatabase: '__schema_design__',
          messages: [...chatState.messages, userMessage, botMessage],
        });
        setActiveConversationId(convResponse.data._id);
        chatState.setIsDbLocked(true);
        onNewConversation();
      } else {
        await api.put(`/conversations/${activeConversationId}`, {
          messages: [...chatState.messages, userMessage, botMessage],
        });
      }
    } catch (error) {
      console.error("Schema design error:", error);
      chatState.setMessages((prev) => [...prev, {
        sender: "bot",
        text: `Error: ${error.response?.data?.message || error.message || 'Failed to process schema request'}`,
        isError: true,
      }]);
    } finally {
      chatState.setIsLoading(false);
    }
  };

  // Modified send handler
  const handleSendMessage = async () => {
    if (schemaState.schemaMode) {
      handleSchemaMessageWrapper();
      return;
    }
    chatState.handleSendMessage();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#131314] flex-1 transition-colors duration-200">
      <Header
        ref={headerRef}
        selectedDb={selectedDb}
        setSelectedDb={setSelectedDb}
        isLocked={chatState.isDbLocked || schemaState.schemaMode}
        suggestionsEnabled={suggestionsEnabled}
        setSuggestionsEnabled={setSuggestionsEnabled}
        schemaMode={schemaState.schemaMode}
        toggleSchemaMode={handleToggleSchemaMode}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      
      {/* Main Content Area - Side by Side in Schema Mode */}
      <div 
        ref={containerRef}
        className={`flex flex-1 overflow-hidden ${schemaState.schemaMode ? 'flex-row' : 'flex-col'}`}
      >
        
        {/* Chat Area */}
        <div 
          className="flex flex-col h-full transition-all duration-75 ease-out"
          style={{ width: schemaState.schemaMode && schemaState.currentSchema ? `${panelWidth}%` : '100%' }}
        >
          {/* Messages - scrollable */}
          <div className="flex-1 overflow-y-auto">
            <MessageList messages={chatState.messages} isLoading={chatState.isLoading} />
          </div>
          
          {/* Suggestions - above input */}
          {suggestionsEnabled && !schemaState.schemaMode && (
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
              input={chatState.input}
              setInput={chatState.setInput}
              handleSendMessage={handleSendMessage}
              isLoading={chatState.isLoading}
            />
          </div>
        </div>

        {/* Drag Handle */}
        {schemaState.schemaMode && (schemaState.currentSchema || chatState.isLoading) && (
          <div
            className={`w-1 bg-zinc-200 dark:bg-[#28292A] hover:bg-blue-400 dark:hover:bg-blue-600 cursor-col-resize flex items-center justify-center transition-colors z-10 ${isResizing ? 'bg-blue-500 dark:bg-blue-600' : ''}`}
            onMouseDown={startResizing}
          >
            <div className="h-8 w-0.5 bg-zinc-400 dark:bg-[#C4C7C5] rounded-full opacity-50"></div>
          </div>
        )}

        {/* Schema Designer Panel - Side by Side */}
        {schemaState.schemaMode && (schemaState.currentSchema || chatState.isLoading) && (
          <SchemaPanel
            currentSchema={schemaState.currentSchema}
            isLoading={chatState.isLoading}
            schemaComplete={schemaState.schemaComplete}
            onCreateClick={() => schemaState.setShowCreateDialog(true)}
            panelWidth={panelWidth}
          />
        )}
      </div>
      
      {/* Schema Creation Dialog */}
      {schemaState.showCreateDialog && schemaState.currentSchema && (
        <SchemaCreationDialog
          schema={schemaState.currentSchema}
          onClose={() => schemaState.setShowCreateDialog(false)}
          onConfirm={schemaState.handleCreateDatabase}
        />
      )}
    </div>
  );
};

export default ChatWindow;
