/**
 * Database Routes
 * Routes for database operations
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const databaseController = require('../controllers/databaseController');

// Get available databases (requires authentication)
router.get('/', authMiddleware, databaseController.getAvailableDatabases);

module.exports = router;
