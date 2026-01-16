/**
 * Schema Controller
 * Handles database schema design and creation
 */

const { designSchema, visualizeSchema } = require('../tools/schema_designer');
const { validateSchema, validateDatabaseName } = require('../utils/schema_validator');
const { generateFullDDL, generateTablesOnly } = require('../utils/ddl_generator');
const { getMongoDb } = require('../services/dbPoolManager');
const { Pool } = require('pg');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * Schema design conversation endpoint
 * Allows users to iteratively design a schema through conversation
 */
async function designSchemaConversation(req, res, next) {
  try {
    const { message, currentSchema, conversationHistory } = req.body;
    
    if (!message || typeof message !== 'string') {
      throw new AppError('Message is required', 400);
    }
    
    logger.info('Schema design conversation started', { userId: req.user.id });
    
    // Call the AI schema designer
    const result = await designSchema(message, currentSchema, conversationHistory || []);
    
    // Add text visualization
    result.visualization = visualizeSchema(result.schema);
    
    res.json(result);
    
  } catch (error) {
    next(error);
  }
}

/**
 * Preview DDL without executing
 * Returns the SQL statements that would be executed
 */
async function previewDDL(req, res, next) {
  try {
    const { dbName, schema } = req.body;
    
    console.log('Preview DDL request:', { dbName, schemaTablesCount: schema?.tables?.length });
    
    if (!dbName) {
      return res.status(400).json({ message: 'Database name is required' });
    }
    
    if (!schema) {
      return res.status(400).json({ message: 'Schema is required' });
    }
    
    // Validate with explicit error handling
    try {
      validateDatabaseName(dbName);
    } catch (validationError) {
      console.error('Database name validation failed:', validationError.message);
      return res.status(400).json({ message: validationError.message });
    }
    
    try {
      validateSchema(schema);
    } catch (validationError) {
      console.error('Schema validation failed:', validationError.message);
      return res.status(400).json({ message: validationError.message });
    }
    
    // Generate DDL
    const ddl = generateFullDDL(dbName, schema);
    
    res.json({ ddl });
    
  } catch (error) {
    console.error('Preview DDL error:', error);
    next(error);
  }
}

/**
 * Create database from schema
 * Executes the DDL and creates the actual database
 */
async function createDatabase(req, res, next) {
  let adminClient = null;
  let newDbClient = null;
  
  try {
    const { dbName, schema } = req.body;
    const userId = req.user.id;
    
    if (!dbName) {
      return res.status(400).json({ message: 'Database name is required' });
    }
    
    if (!schema) {
      return res.status(400).json({ message: 'Schema is required' });
    }
    
    // Validate with explicit error handling
    try {
      validateDatabaseName(dbName);
    } catch (validationError) {
      console.error('Database name validation failed:', validationError.message);
      return res.status(400).json({ message: validationError.message });
    }
    
    try {
      validateSchema(schema);
    } catch (validationError) {
      console.error('Schema validation failed:', validationError.message);
      return res.status(400).json({ message: validationError.message });
    }
    
    logger.info(`Creating database: ${dbName}`, { userId });
    
    // Connect to PostgreSQL as admin to create database
    const adminPool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5434,
      user: process.env.POSTGRES_USER || 'admin',
      password: process.env.POSTGRES_PASSWORD || 'admin_password',
      database: 'postgres', // Connect to default postgres database
    });
    
    adminClient = await adminPool.connect();
    
    // Check if database already exists
    const checkResult = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    
    if (checkResult.rows.length > 0) {
      throw new AppError(`Database "${dbName}" already exists`, 400);
    }
    
    // Create the database
    await adminClient.query(`CREATE DATABASE "${dbName}"`);
    logger.info(`Database "${dbName}" created successfully`);
    
    // Release admin connection
    adminClient.release();
    adminClient = null;
    await adminPool.end();
    
    // Connect to the new database to create tables
    const newDbPool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5434,
      user: process.env.POSTGRES_USER || 'admin',
      password: process.env.POSTGRES_PASSWORD || 'admin_password',
      database: dbName,
    });
    
    newDbClient = await newDbPool.connect();
    
    // Generate and execute table creation DDL
    const tableDDL = generateTablesOnly(schema);
    
    // Execute the DDL (split by semicolons and execute each statement)
    const statements = tableDDL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      await newDbClient.query(statement);
    }
    
    logger.info(`Tables created successfully in database "${dbName}"`);
    
    // Release new database connection
    newDbClient.release();
    newDbClient = null;
    await newDbPool.end();
    
    // Save database info to MongoDB
    const db = getMongoDb();
    await db.collection('user_databases').insertOne({
      userId: req.user._id,
      dbName,
      schema,
      createdAt: new Date(),
    });
    
    res.json({
      success: true,
      message: `Database "${dbName}" created successfully`,
      dbName,
      tablesCreated: schema.tables.length,
    });
    
  } catch (error) {
    // Cleanup on error
    if (adminClient) {
      try {
        adminClient.release();
      } catch (e) {
        logger.error('Error releasing admin client:', e);
      }
    }
    
    if (newDbClient) {
      try {
        newDbClient.release();
      } catch (e) {
        logger.error('Error releasing new db client:', e);
      }
    }
    
    next(error);
  }
}

/**
 * Get list of user's created databases
 */
async function getUserDatabases(req, res, next) {
  try {
    const db = getMongoDb();
    const databases = await db
      .collection('user_databases')
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(databases);
    
  } catch (error) {
    next(error);
  }
}

module.exports = {
  designSchemaConversation,
  previewDDL,
  createDatabase,
  getUserDatabases,
};
