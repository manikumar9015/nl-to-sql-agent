/**
 * Suggestion Controller
 * Handles all query suggestion endpoints
 */

const suggestionService = require('../services/suggestionService');

/**
 * Get schema-based suggestions for a database
 */
const getSchemaSuggestions = async (req, res) => {
  try {
    const { dbName } = req.query;
    
    if (!dbName) {
      return res.status(400).json({ error: 'dbName is required' });
    }

    const suggestions = await suggestionService.generateSchemaSuggestions(dbName);
    res.json({ suggestions });
  } catch (error) {
    console.error('[SUGGESTIONS ERROR]:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
};

/**
 * Get all types of suggestions (schema-based, contextual, popular)
 */
const getAllSuggestions = async (req, res) => {
  try {
    const { dbName, conversationId } = req.query;
    
    if (!dbName) {
      return res.status(400).json({ error: 'dbName is required' });
    }

    const allSuggestions = await suggestionService.getAllSuggestions(dbName, conversationId);
    res.json(allSuggestions);
  } catch (error) {
    console.error('[SUGGESTIONS ERROR]:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
};

/**
 * Get contextual suggestions based on conversation
 */
const getContextualSuggestions = async (req, res) => {
  try {
    const { conversationId, dbName } = req.query;
    
    if (!conversationId || !dbName) {
      return res.status(400).json({ error: 'conversationId and dbName are required' });
    }

    const suggestions = await suggestionService.generateContextualSuggestions(conversationId, dbName);
    res.json({ suggestions });
  } catch (error) {
    console.error('[CONTEXTUAL SUGGESTIONS ERROR]:', error);
    res.status(500).json({ error: 'Failed to generate contextual suggestions' });
  }
};

/**
 * Get popular queries ("People also asked")
 */
const getPopularSuggestions = async (req, res) => {
  try {
    const { dbName } = req.query;
    
    if (!dbName) {
      return res.status(400).json({ error: 'dbName is required' });
    }

    const suggestions = await suggestionService.getPeopleAlsoAsked(dbName);
    res.json({ suggestions });
  } catch (error) {
    console.error('[POPULAR SUGGESTIONS ERROR]:', error);
    res.status(500).json({ error: 'Failed to get popular suggestions' });
  }
};

module.exports = {
  getSchemaSuggestions,
  getAllSuggestions,
  getContextualSuggestions,
  getPopularSuggestions,
};
