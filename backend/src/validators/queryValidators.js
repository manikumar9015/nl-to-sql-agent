/**
 * Query Validation Schemas
 * Zod schemas for saved query endpoints
 */

const { z } = require('zod');

// Save query schema
const saveQuerySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Query name is required').max(100),
    sql: z.string().min(1, 'SQL query is required'),
    dbName: z.string().min(1, 'Database name is required'),
    visualizationType: z.string().min(1, 'Visualization type is required'),
  }),
});

// Query ID schema
const queryIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Query ID is required'),
  }),
});

module.exports = {
  saveQuerySchema,
  queryIdSchema,
};
