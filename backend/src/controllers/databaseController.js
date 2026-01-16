/**
 * Database Controller
 * Handles database-related endpoints
 */

const { Pool } = require('pg');
const logger = require('../utils/logger');

/**
 * Get list of available databases from PostgreSQL
 */
const getAvailableDatabases = async (req, res) => {
  let client = null;
  try {
    // Connect to PostgreSQL
    const pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5434,
      user: process.env.POSTGRES_USER || 'admin',
      password: process.env.POSTGRES_PASSWORD || 'admin_password',
      database: 'postgres', // Connect to default postgres database
    });

    client = await pool.connect();
    
    // Query all databases except system databases
    const result = await client.query(`
      SELECT datname 
      FROM pg_database 
      WHERE datistemplate = false 
        AND datname NOT IN ('postgres')
      ORDER BY datname
    `);
    
    const databases = result.rows.map(row => row.datname);
    
    logger.info(`Found ${databases.length} databases:`, databases);
    
    client.release();
    await pool.end();
    
    res.json(databases);
    
  } catch (error) {
    logger.error('Failed to get available databases:', error);
    
    if (client) {
      try {
        client.release();
      } catch (e) {
        logger.error('Error releasing client:', e);
      }
    }
    
    // Return hardcoded fallback on error
    res.json(['sales_db', 'student_db']);
  }
};

module.exports = {
  getAvailableDatabases,
};
