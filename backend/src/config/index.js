/**
 * Application Configuration
 * Centralized configuration management for all environment variables
 */

require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database Configuration
  postgres: {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  },

  mongodb: {
    uri: process.env.MONGO_URI,
  },

  // Authentication Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h',
  },

  // AI Configuration
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};

module.exports = config;
