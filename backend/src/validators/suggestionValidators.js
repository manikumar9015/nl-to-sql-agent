/**
 * Suggestion Validation Schemas
 * Zod schemas for suggestion endpoints
 */

const { z } = require('zod');

// Get suggestions schema
const getSuggestionsSchema = z.object({
  query: z.object({
    dbName: z.string().min(1, 'Database name is required'),
  }),
});

// Get contextual suggestions schema
const getContextualSuggestionsSchema = z.object({
  query: z.object({
    conversationId: z.string().min(1, 'Conversation ID is required'),
    dbName: z.string().min(1, 'Database name is required'),
  }),
});

// Get all suggestions schema
const getAllSuggestionsSchema = z.object({
  query: z.object({
    dbName: z.string().min(1, 'Database name is required'),
    conversationId: z.string().optional(),
  }),
});

module.exports = {
  getSuggestionsSchema,
  getContextualSuggestionsSchema,
  getAllSuggestionsSchema,
};
