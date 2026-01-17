/**
 * Application Configuration
 * Centralized configuration management for all environment variables
 */

require('dotenv').config();
const { validateEnv } = require('./envSchema');

// Validate environment variables at startup
const env = validateEnv();

const config = {
  // Server Configuration
  port: env.PORT || 3001,
  nodeEnv: env.NODE_ENV || 'development',

  // Database Configuration
  postgres: {
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    database: env.POSTGRES_DB,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
  },

  mongodb: {
    uri: env.MONGO_URI,
  },

  // Authentication Configuration
  jwt: {
    secret: env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h',
  },

  // AI Configuration
  gemini: {
    apiKey: env.GEMINI_API_KEY,
  },

  // CORS Configuration
  cors: {
    origin: env.CORS_ORIGIN || '*',
  },
};

module.exports = config;
