/**
 * Suggestion Routes
 * Routes for query suggestion endpoints
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const suggestionController = require('../controllers/suggestionController');
const validate = require('../middleware/validate');
const suggestionValidators = require('../validators/suggestionValidators');

// Get schema-based suggestions (no auth required for now)
router.get('/', validate(suggestionValidators.getSuggestionsSchema), suggestionController.getSchemaSuggestions);

// Get all types of suggestions (requires authentication)
router.get('/all', authMiddleware, validate(suggestionValidators.getAllSuggestionsSchema), suggestionController.getAllSuggestions);

// Get contextual suggestions (requires authentication)
router.get('/contextual', authMiddleware, validate(suggestionValidators.getContextualSuggestionsSchema), suggestionController.getContextualSuggestions);

// Get popular queries
router.get('/popular', validate(suggestionValidators.getSuggestionsSchema), suggestionController.getPopularSuggestions);

module.exports = router;
