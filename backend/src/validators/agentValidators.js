/**
 * Agent Validation Schemas
 * Zod schemas for agent endpoints
 */

const { z } = require('zod');

// AI test schema
const aiTestSchema = z.object({
  body: z.object({
    prompt: z.string().min(1, 'Prompt is required'),
  }),
});

// Schema retrieval schema
const getSchemaParamsSchema = z.object({
  params: z.object({
    dbName: z.string().min(1, 'Database name is required'),
  }),
});

// SQL generation schema
const generateSqlSchema = z.object({
  body: z.object({
    prompt: z.string().min(1, 'Prompt is required'),
    dbName: z.string().min(1, 'Database name is required'),
  }),
});

// Agent chat schema
const agentChatSchema = z.object({
  body: z.object({
    prompt: z.string().min(1, 'Prompt is required'),
    dbName: z.string().min(1, 'Database name is required'),
    conversationId: z.string().optional(),
    conversationHistory: z.array(z.any()).optional().default([]),
    lastResult: z.any().optional().nullable(),
  }),
});

module.exports = {
  aiTestSchema,
  getSchemaParamsSchema,
  generateSqlSchema,
  agentChatSchema,
};
