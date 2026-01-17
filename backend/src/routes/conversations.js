/**
 * Conversation Routes
 * Routes for conversation management
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const conversationController = require('../controllers/conversationController');
const validate = require('../middleware/validate');
const conversationValidators = require('../validators/conversationValidators');

// All conversation routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /conversations:
 *   get:
 *     summary: Get all conversations for authenticated user
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Unauthorized
 */
router.get('/', conversationController.getConversations);

/**
 * @swagger
 * /conversations/{id}:
 *   get:
 *     summary: Get specific conversation by ID
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 *       404:
 *         description: Conversation not found
 */
router.get('/:id', validate(conversationValidators.conversationIdSchema), conversationController.getConversationById);

/**
 * @swagger
 * /conversations/{id}/title:
 *   put:
 *     summary: Update conversation title (auto-generated if not provided)
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Title updated
 */
router.put('/:id/title', validate(conversationValidators.conversationIdSchema), conversationController.updateConversationTitle);

/**
 * @swagger
 * /conversations:
 *   post:
 *     summary: Create new conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - selectedDatabase
 *             properties:
 *               selectedDatabase:
 *                 type: string
 *               messages:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Message'
 *     responses:
 *       201:
 *         description: Conversation created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 */
router.post('/', conversationController.createConversation);

/**
 * @swagger
 * /conversations/{id}:
 *   put:
 *     summary: Update conversation messages
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Message'
 *     responses:
 *       200:
 *         description: Conversation updated
 */
router.put('/:id', validate(conversationValidators.conversationIdSchema), conversationController.updateConversation);

/**
 * @swagger
 * /conversations/{id}:
 *   delete:
 *     summary: Delete conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation deleted
 *       404:
 *         description: Conversation not found
 */
router.delete('/:id', validate(conversationValidators.conversationIdSchema), conversationController.deleteConversation);

module.exports = router;
