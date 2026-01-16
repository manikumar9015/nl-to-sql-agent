/**
 * Auth Routes
 * Routes for authentication
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const authValidators = require('../validators/authValidators');

// Register new user
router.post('/register', validate(authValidators.registerSchema), authController.register);

// User login
router.post('/login', validate(authValidators.loginSchema), authController.login);

module.exports = router;
