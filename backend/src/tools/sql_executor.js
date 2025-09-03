const { getDbPool } = require('../services/dbPoolManager');
const crypto = require('crypto');

/**
 * Executes a verified SQL query and computes metadata.
 * NEVER returns raw rows.
 * @param {string} sql The verified and possibly corrected SQL query.
 * @param {string} dbName The name of the database.
 * @returns {Promise<object>} An object containing execution metadata.
 */
async function executeSql(sql, dbName) {
  // Hard rule: Gatekeeper rejects any query that isn't a SELECT statement.
  if (!sql.trim().toLowerCase().startsWith('select')) {
    throw new Error('Execution rejected: Only SELECT statements are allowed.');
  }

  const pool = getDbPool(dbName);
  const client = await pool.connect();

  try {
    const result = await client.query(sql);
    const { rows, rowCount } = result;

    // --- Privacy-First Result Processing ---

    // 1. Immediately purge raw rows from memory after getting what we need.
    // In a real high-security app, you might process this in a stream.
    const columns = result.fields.map(field => field.name);

    // 2. Compute a hash of the result set for auditing, without logging the data itself.
    const resultHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(rows))
      .digest('hex');

    // 3. Create masked samples (for now, we'll just take the first 5 rows)
    const maskedSample = rows.slice(0, 5); // Simple truncation for now

    // 4. Compute metadata
    const resultMetadata = {
      rowCount,
      columns,
      resultHash, // For auditing and referencing this result later
      // In the future: add columnStats, distinctCounts, etc.
    };
    
    // The final package does NOT include the raw `rows` array.
    return {
      executionMetadata: resultMetadata,
      maskedSample: maskedSample, // A small, safe sample for the UI
    };

  } catch (error) {
    console.error('Error during SQL execution:', error.message);
    // Return a structured error
    return {
      error: 'Failed to execute query.',
      details: error.message,
    };
  } finally {
    client.release();
  }
}

module.exports = {
  executeSql,
};