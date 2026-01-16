/**
 * Saved Query Routes
 * Routes for saved query operations
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const savedQueryController = require('../controllers/savedQueryController');
const validate = require('../middleware/validate');
const queryValidators = require('../validators/queryValidators');

// All saved query routes require authentication
router.use(authMiddleware);

// Get all saved queries
router.get('/', savedQueryController.getSavedQueries);

// Save a new query
router.post('/', validate(queryValidators.saveQuerySchema), savedQueryController.saveQuery);

// Execute saved query
router.post('/:id/execute', validate(queryValidators.queryIdSchema), savedQueryController.executeQuery);

// Delete saved query
router.delete('/:id', validate(queryValidators.queryIdSchema), savedQueryController.deleteSavedQuery);

module.exports = router;
