/**
 * Environment Variable Schema
 * Validates all required environment variables at startup using Zod
 */

const { z } = require('zod');

const envSchema = z.object({
  // Server Configuration
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // PostgreSQL Configuration
  POSTGRES_HOST: z.string().min(1, 'POSTGRES_HOST is required'),
  POSTGRES_PORT: z.string().default('5432'),
  POSTGRES_DB: z.string().min(1, 'POSTGRES_DB is required'),
  POSTGRES_USER: z.string().min(1, 'POSTGRES_USER is required'),
  POSTGRES_PASSWORD: z.string().min(1, 'POSTGRES_PASSWORD is required'),

  // MongoDB Configuration - supports both URI and individual vars
  MONGO_URI: z.string().optional(),
  MONGO_HOST: z.string().optional(),
  MONGO_PORT: z.string().optional(),
  MONGO_USER: z.string().optional(),
  MONGO_PASSWORD: z.string().optional(),
  MONGO_DB: z.string().optional(),

  // Authentication
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters'),

  // AI Configuration
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),

  // Optional Configuration
  CORS_ORIGIN: z.string().optional(),
}).refine((data) => {
  // Require either MONGO_URI or the individual MongoDB variables
  const hasUri = !!data.MONGO_URI;
  const hasIndividual = data.MONGO_HOST && data.MONGO_USER && data.MONGO_PASSWORD;
  return hasUri || hasIndividual;
}, {
  message: 'Either MONGO_URI or MONGO_HOST/MONGO_USER/MONGO_PASSWORD must be provided',
  path: ['MONGO_URI'],
});

/**
 * Builds MongoDB URI from individual variables if MONGO_URI is not provided
 */
function buildMongoUri(env) {
  if (env.MONGO_URI) {
    return env.MONGO_URI;
  }
  const host = env.MONGO_HOST || 'localhost';
  const port = env.MONGO_PORT || '27017';
  const user = env.MONGO_USER;
  const password = env.MONGO_PASSWORD;
  const db = env.MONGO_DB || 'querycompass';
  
  return `mongodb://${user}:${password}@${host}:${port}/${db}?authSource=admin`;
}

/**
 * Validates environment variables and returns parsed config
 * @returns {object} Validated environment variables with built MONGO_URI
 * @throws {Error} If validation fails
 */
function validateEnv() {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('\n❌ Invalid environment configuration:\n');
    result.error.issues.forEach((issue) => {
      console.error(`   • ${issue.path.join('.')}: ${issue.message}`);
    });
    console.error('\nPlease check your .env file and ensure all required variables are set.\n');
    process.exit(1);
  }
  
  // Build MONGO_URI if not provided
  const data = result.data;
  data.MONGO_URI = buildMongoUri(data);
  
  return data;
}

module.exports = { envSchema, validateEnv };
