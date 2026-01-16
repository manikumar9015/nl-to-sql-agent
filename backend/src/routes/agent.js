/**
 * Agent Routes
 * Routes for agent operations including chat, AI tests, and SQL generation
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const agentController = require('../controllers/agentController');
const agentStreamController = require('../controllers/agentStreamController');
const validate = require('../middleware/validate');
const agentValidators = require('../validators/agentValidators');

// Health check
router.get('/health', agentController.getHealthCheck);

// AI test
router.post('/ai-test', validate(agentValidators.aiTestSchema), agentController.testAI);

// Schema retrieval
router.get('/schema/:dbName', validate(agentValidators.getSchemaParamsSchema), agentController.getSchema);

// SQL generation test
router.post('/generate-sql', validate(agentValidators.generateSqlSchema), agentController.generateSQL);

// Main agent chat endpoint (POST - existing)
router.post('/agent/chat', authMiddleware, validate(agentValidators.agentChatSchema), agentController.handleAgentChat);

// SSE streaming chat endpoint (GET - new)
router.get('/agent/chat-stream', authMiddleware, agentStreamController.handleAgentChatStream);

module.exports = router;
