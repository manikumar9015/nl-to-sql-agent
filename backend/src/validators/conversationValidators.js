/**
 * Conversation Validation Schemas
 * Zod schemas for conversation endpoints
 */

const { z } = require('zod');

// Conversation ID schema
const conversationIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Conversation ID is required'),
  }),
});

module.exports = {
  conversationIdSchema,
};
