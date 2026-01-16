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

// Get all conversations
router.get('/', conversationController.getConversations);

// Get specific conversation
router.get('/:id', validate(conversationValidators.conversationIdSchema), conversationController.getConversationById);

// Update conversation title
router.put('/:id/title', validate(conversationValidators.conversationIdSchema), conversationController.updateConversationTitle);

// Create new conversation
router.post('/', conversationController.createConversation);

// Update conversation (messages)
router.put('/:id', validate(conversationValidators.conversationIdSchema), conversationController.updateConversation);

// Delete conversation
router.delete('/:id', validate(conversationValidators.conversationIdSchema), conversationController.deleteConversation);

module.exports = router;
