const { getMongoDb } = require('./dbPoolManager');
const { getLiveDatabaseSchema } = require('./schemaService');
const { generateText } = require('./aiClient');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

const suggestionPromptTemplate = fs.readFileSync(
  path.join(__dirname, '../prompts/suggestion_analyzer.prompt.txt'),
  'utf-8'
);

// Cache for suggestions to avoid regenerating too frequently
const suggestionCache = new Map();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generates schema-based query suggestions by analyzing the database structure.
 * @param {string} dbName The database name
 * @returns {Promise<Array<string>>} Array of suggested natural language questions
 */
async function generateSchemaSuggestions(dbName) {
  const cacheKey = `schema:${dbName}`;
  
  // Check cache
  if (suggestionCache.has(cacheKey)) {
    const cached = suggestionCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      console.log('[SUGGESTIONS] Returning cached schema suggestions');
      return cached.suggestions;
    }
  }

  console.log('[SUGGESTIONS] Generating new schema-based suggestions...');
  
  try {
    const schemaString = await getLiveDatabaseSchema(dbName);
    
    const prompt = suggestionPromptTemplate
      .replace('{schema}', schemaString)
      .replace('{database_name}', dbName);

    const response = await generateText(prompt);
    
    // Parse the JSON response
    const cleanedJson = response
      .replace(/```/g, "")
      .replace("json", "")
      .trim();
    const result = JSON.parse(cleanedJson);
    
    const suggestions = result.suggestions || [];
    
    // Cache the results
    suggestionCache.set(cacheKey, {
      suggestions,
      timestamp: Date.now(),
    });
    
    console.log(`[SUGGESTIONS] Generated ${suggestions.length} schema-based suggestions`);
    return suggestions;
    
  } catch (error) {
    console.error('[SUGGESTIONS] Error generating schema suggestions:', error);
    return [
      "How many records do we have?",
      "Show me recent data",
      "What are the totals?",
    ];
  }
}

/**
 * Generates contextual suggestions based on the current conversation.
 * @param {string} conversationId The conversation ID
 * @param {string} dbName The database name
 * @returns {Promise<Array<string>>} Array of contextual suggestions
 */
async function generateContextualSuggestions(conversationId, dbName) {
  if (!conversationId) {
    return [];
  }

  console.log('[SUGGESTIONS] Generating contextual suggestions...');
  
  try {
    const db = getMongoDb();
    const conversation = await db.collection('conversations').findOne({
      _id: new ObjectId(conversationId),
    });

    if (!conversation || !conversation.messages || conversation.messages.length === 0) {
      return [];
    }

    // Get the last few messages to understand context
    const recentMessages = conversation.messages.slice(-3);
    const lastExecutedSql = recentMessages
      .reverse()
      .find(msg => msg.sender === 'bot' && msg.executedSql);

    if (!lastExecutedSql) {
      return [];
    }

    // Generate contextual follow-up suggestions
    const suggestions = [];
    
    // If they queried customers, suggest related queries
    if (lastExecutedSql.executedSql.toLowerCase().includes('customers')) {
      suggestions.push("Show orders for these customers");
      suggestions.push("Group these by state");
    }
    
    // If they queried orders, suggest aggregations
    if (lastExecutedSql.executedSql.toLowerCase().includes('orders')) {
      suggestions.push("What's the total amount?");
      suggestions.push("Show this by month");
    }
    
    // If they have a WHERE clause, suggest modifying it
    if (lastExecutedSql.executedSql.toLowerCase().includes('where')) {
      suggestions.push("Show all results (remove filter)");
      suggestions.push("Change the filter criteria");
    }
    
    // If no LIMIT, suggest adding one
    if (!lastExecutedSql.executedSql.toLowerCase().includes('limit')) {
      suggestions.push("Show only top 10");
    }
    
    return suggestions.slice(0, 3); // Return max 3 contextual suggestions
    
  } catch (error) {
    console.error('[SUGGESTIONS] Error generating contextual suggestions:', error);
    return [];
  }
}

/**
 * Mines conversation history to find commonly asked questions ("People also asked").
 * @param {string} dbName The database name
 * @returns {Promise<Array<string>>} Array of popular questions
 */
async function getPeopleAlsoAsked(dbName) {
  const cacheKey = `popular:${dbName}`;
  
  // Check cache
  if (suggestionCache.has(cacheKey)) {
    const cached = suggestionCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      console.log('[SUGGESTIONS] Returning cached popular questions');
      return cached.suggestions;
    }
  }

  console.log('[SUGGESTIONS] Mining conversation history for popular questions...');
  
  try {
    const db = getMongoDb();
    
    // Find all conversations for this database
    const conversations = await db.collection('conversations')
      .find({ selectedDatabase: dbName })
      .limit(100) // Look at last 100 conversations
      .toArray();

    // Extract all user messages
    const userQueries = [];
    conversations.forEach(conv => {
      if (conv.messages) {
        conv.messages.forEach(msg => {
          if (msg.sender === 'user' && msg.text) {
            userQueries.push(msg.text.toLowerCase());
          }
        });
      }
    });

    // Count frequency of similar queries (simple approach)
    const queryFrequency = {};
    userQueries.forEach(query => {
      // Normalize queries by removing common variations
      const normalized = query
        .replace(/\d+/g, 'N') // Replace numbers with N
        .replace(/['"][^'"]*['"]/g, 'X') // Replace quoted strings with X
        .trim();
      
      queryFrequency[normalized] = (queryFrequency[normalized] || 0) + 1;
    });

    // Get top queries
    const sortedQueries = Object.entries(queryFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([query]) => {
        // Find an actual example of this query pattern
        const example = userQueries.find(q => 
          q.replace(/\d+/g, 'N').replace(/['"][^'"]*['"]/g, 'X').trim() === query
        );
        return example || query;
      });

    const suggestions = sortedQueries.length > 0 ? sortedQueries : [
      "Show me all data",
      "What's the total count?",
      "Display recent records",
    ];

    // Cache the results
    suggestionCache.set(cacheKey, {
      suggestions,
      timestamp: Date.now(),
    });

    console.log(`[SUGGESTIONS] Found ${suggestions.length} popular questions`);
    return suggestions;
    
  } catch (error) {
    console.error('[SUGGESTIONS] Error getting popular questions:', error);
    return [
      "Show me all data",
      "What's the total count?", 
      "Display recent records",
    ];
  }
}

/**
 * Generates all types of suggestions for a given context.
 * @param {string} dbName The database name
 * @param {string} conversationId Optional conversation ID for context
 * @returns {Promise<Object>} Object with schema, contextual, and popular suggestions
 */
async function getAllSuggestions(dbName, conversationId = null) {
  const [schemaSuggestions, contextualSuggestions, popularSuggestions] = await Promise.all([
    generateSchemaSuggestions(dbName),
    conversationId ? generateContextualSuggestions(conversationId, dbName) : Promise.resolve([]),
    getPeopleAlsoAsked(dbName),
  ]);

  return {
    getStarted: schemaSuggestions.slice(0, 5),
    contextual: contextualSuggestions,
    peopleAlsoAsked: popularSuggestions,
  };
}

module.exports = {
  generateSchemaSuggestions,
  generateContextualSuggestions,
  getPeopleAlsoAsked,
  getAllSuggestions,
};
