/**
 * Swagger/OpenAPI Configuration
 * Generates OpenAPI 3.0 specification from JSDoc comments in route files
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QueryCompass API',
      version: '1.0.0',
      description: 'AI-powered Natural Language to SQL database query agent. This API provides endpoints for authentication, database querying, schema design, and conversation management.',
      contact: {
        name: 'QueryCompass Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoint',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Error message' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            sender: { type: 'string', enum: ['user', 'bot'] },
            text: { type: 'string' },
            sql: { type: 'string' },
            data: { type: 'array', items: { type: 'object' } },
            visualization: { type: 'object' },
          },
        },
        Conversation: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            title: { type: 'string' },
            selectedDatabase: { type: 'string' },
            messages: { type: 'array', items: { $ref: '#/components/schemas/Message' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
