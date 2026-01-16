/**
 * Admin Routes
 * Routes for admin operations
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Get audit logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
