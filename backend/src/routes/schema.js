/**
 * Schema Routes
 * Routes for database schema design and creation
 */

const express = require('express');
const router = express.Router();
const schemaController = require('../controllers/schemaController');
const authMiddleware = require('../middleware/authMiddleware');

// All schema routes require authentication
router.use(authMiddleware);

// Schema design conversation
router.post('/design', schemaController.designSchemaConversation);

// Preview DDL without executing
router.post('/preview', schemaController.previewDDL);

// Create database from schema
router.post('/create', schemaController.createDatabase);

// Get user's created databases
router.get('/databases', schemaController.getUserDatabases);

module.exports = router;
