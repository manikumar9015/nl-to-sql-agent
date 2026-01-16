/**
 * Auth Controller
 * Handles authentication endpoints
 */

const authService = require('../services/authService');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

/**
 * Register new user
 */
const register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    logger.info('User registration attempt', { username, role });
    
    const result = await authService.registerUser(username, password, role);
    
    logger.info('User registered successfully', { username });
    res.status(201).json(result);
  } catch (error) {
    logger.error('Registration failed', { error: error.message, username: req.body.username });
    next(error);
  }
};

/**
 * User login
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    logger.info('User login attempt', { username });
    
    const result = await authService.loginUser(username, password);
    
    logger.info('User logged in successfully', { username });
    res.json(result);
  } catch (error) {
    logger.error('Login failed', { error: error.message, username: req.body.username });
    next(error);
  }
};

module.exports = {
  register,
  login,
};
