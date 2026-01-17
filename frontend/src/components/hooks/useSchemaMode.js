import { useState } from 'react';
import api from '../../api';

/**
 * Custom hook for schema designer mode functionality
 * @param {object} params - Hook parameters
 * @param {function} params.setMessages - Message state setter
 * @param {function} params.setActiveConversationId - Conversation ID setter
 * @param {function} params.onNewConversation - Callback for new conversation
 * @param {object} params.headerRef - Ref to Header component
 * @returns {object} - Schema mode state and handlers
 */
const useSchemaMode = ({ 
  setMessages, 
  setActiveConversationId, 
  onNewConversation,
  headerRef,
  messages,
}) => {
  const [schemaMode, setSchemaMode] = useState(false);
  const [currentSchema, setCurrentSchema] = useState(null);
  const [schemaHistory, setSchemaHistory] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [schemaComplete, setSchemaComplete] = useState(false);

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
      // Clear active conversation to start fresh
      setActiveConversationId(null);
    }
  };

  const handleSchemaMessage = async (input, setInput, setIsLoading, activeConversationId, setIsDbLocked) => {
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

  const restoreSchemaFromMessages = (loadedMessages) => {
    // Try to restore the most recent schema from messages
    const messagesWithSchema = loadedMessages
      .filter(msg => msg.sender === 'bot' && msg.schema)
      .reverse(); // Most recent first
    
    if (messagesWithSchema.length > 0) {
      const lastSchema = messagesWithSchema[0].schema;
      setCurrentSchema(lastSchema);
      console.log('Restored schema with', lastSchema.tables?.length, 'tables');
    }
  };

  return {
    schemaMode,
    setSchemaMode,
    currentSchema,
    setCurrentSchema,
    schemaHistory,
    showCreateDialog,
    setShowCreateDialog,
    schemaComplete,
    toggleSchemaMode,
    handleSchemaMessage,
    handleCreateDatabase,
    restoreSchemaFromMessages,
  };
};

export default useSchemaMode;
