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

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get('/health', agentController.getHealthCheck);

/**
 * @swagger
 * /ai-test:
 *   post:
 *     summary: Test AI connection
 *     tags: [Agent]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: Hello AI
 *     responses:
 *       200:
 *         description: AI response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 */
router.post('/ai-test', validate(agentValidators.aiTestSchema), agentController.testAI);

/**
 * @swagger
 * /schema/{dbName}:
 *   get:
 *     summary: Get database schema
 *     tags: [Agent]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: dbName
 *         required: true
 *         schema:
 *           type: string
 *         description: Database name
 *     responses:
 *       200:
 *         description: Database schema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tables:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/schema/:dbName', validate(agentValidators.getSchemaParamsSchema), agentController.getSchema);

/**
 * @swagger
 * /generate-sql:
 *   post:
 *     summary: Generate SQL from natural language
 *     tags: [Agent]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *               - dbName
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: Show me all customers
 *               dbName:
 *                 type: string
 *                 example: sales_db
 *     responses:
 *       200:
 *         description: Generated SQL query
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sql:
 *                   type: string
 */
router.post('/generate-sql', validate(agentValidators.generateSqlSchema), agentController.generateSQL);

/**
 * @swagger
 * /agent/chat:
 *   post:
 *     summary: Main agent chat endpoint
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *               - dbName
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Natural language query
 *               dbName:
 *                 type: string
 *                 description: Target database name
 *               conversationId:
 *                 type: string
 *                 description: Existing conversation ID (optional)
 *     responses:
 *       200:
 *         description: Agent response with SQL, data, and visualization
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                 sql:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 visualization:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.post('/agent/chat', authMiddleware, validate(agentValidators.agentChatSchema), agentController.handleAgentChat);

/**
 * @swagger
 * /agent/chat-stream:
 *   get:
 *     summary: SSE streaming chat endpoint
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: prompt
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: dbName
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: conversationId
 *         schema:
 *           type: string
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT token (passed as query param for SSE)
 *     responses:
 *       200:
 *         description: Server-Sent Events stream
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 */
router.get('/agent/chat-stream', authMiddleware, agentStreamController.handleAgentChatStream);

module.exports = router;
