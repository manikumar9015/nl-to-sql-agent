/**
 * Conversation Controller
 * Handles conversation management endpoints
 */

const conversationService = require('../services/conversationService');
const aiClient = require('../services/aiClient');
const fs = require('fs');

const titleGeneratorPrompt = fs.readFileSync('./src/prompts/title_generator.prompt.txt', 'utf-8');

/**
 * Get all conversations for logged-in user
 */
const getConversations = async (req, res) => {
  try {
    const conversations = await conversationService.getConversationsForUser(req.user.userId);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
};

/**
 * Get a single conversation by its ID
 */
const getConversationById = async (req, res) => {
  try {
    const conversation = await conversationService.getConversationById(req.params.id, req.user.userId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversation.' });
  }
};

/**
 * Update conversation title
 */
const updateConversationTitle = async (req, res) => {
  const conversationId = req.params.id;
  const userId = req.user.userId;

  try {
    const conversation = await conversationService.getConversationById(conversationId, userId);

    // Security and idempotency checks
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }
    if (conversation.title !== 'New Chat') {
      return res.status(400).json({ error: 'Conversation already has a title.' });
    }

    const historyString = conversation.messages
      .map(turn => `${turn.sender === 'user' ? 'User' : 'Bot'}: ${turn.text}`)
      .join('\n');

    const finalPrompt = titleGeneratorPrompt.replace('{history}', historyString);

    const newTitle = await aiClient.generateText(finalPrompt);

    await conversationService.updateConversationTitle(conversationId, userId, newTitle.trim());

    res.json({ success: true, newTitle: newTitle.trim() });
  } catch (error) {
    console.error('Failed to generate title:', error);
    res.status(500).json({ error: 'Failed to generate title.' });
  }
};

/**
 * Create new conversation
 */
const createConversation = async (req, res) => {
  try {
    const { selectedDatabase, messages } = req.body;
    const userId = req.user.userId;

    const conversation = await conversationService.createConversation(
      userId,
      selectedDatabase,
      messages || []
    );

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Failed to create conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation.' });
  }
};

/**
 * Update conversation (messages)
 */
const updateConversation = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.userId;
    const { messages } = req.body;

    const conversation = await conversationService.getConversationById(conversationId, userId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    await conversationService.updateConversationMessages(conversationId, userId, messages);

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update conversation:', error);
    res.status(500).json({ error: 'Failed to update conversation.' });
  }
};

/**
 * Delete conversation
 */
const deleteConversation = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.userId;

    const conversation = await conversationService.getConversationById(conversationId, userId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    await conversationService.deleteConversation(conversationId, userId);

    res.json({ success: true, message: 'Conversation deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation.' });
  }
};

module.exports = {
  getConversations,
  getConversationById,
  updateConversationTitle,
  createConversation,
  updateConversation,
  deleteConversation,
};
