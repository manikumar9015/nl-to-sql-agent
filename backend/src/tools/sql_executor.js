const { getDbPool } = require('../services/dbPoolManager');
const crypto = require('crypto');

/**
 * Executes a verified SQL query and computes metadata.
 * Enforces Role-Based Access Control.
 * @param {string} sql The verified SQL query.
 * @param {string} dbName The name of the database.
 * @param {object} user The user object from the JWT (contains role).
 * @returns {Promise<object>} An object containing execution metadata.
 */
async function executeSql(sql, dbName, user) {
  // --- RBAC ENFORCEMENT ---
  const isModificationQuery = /\b(insert|update|delete|drop|alter|truncate)\b/i.test(sql);

  if (isModificationQuery && user.role !== 'admin') {
    console.warn(`[RBAC] Denied: User '${user.username}' attempted a modification query.`);
    throw new Error('Permission denied. Only admins can modify data.');
  }

  const pool = getDbPool(dbName);
  const client = await pool.connect();

  try {
    const result = await client.query(sql);
    const { rows, rowCount, command } = result;

    // --- NEW LOGIC TO HANDLE DIFFERENT QUERY TYPES ---
    if (isModificationQuery) {
      // For UPDATE, INSERT, DELETE, return a simple success object.
      // This signals to the orchestrator to skip the visualization step.
      return {
        isModification: true,
        executionMetadata: {
          rowCount,
          operation: command, // This will be 'UPDATE', 'INSERT', or 'DELETE'
        }
      };
    }
    // --- END NEW LOGIC ---

    // For standard SELECT queries, proceed with full metadata processing as before.
    const columns = result.fields.map(field => field.name);
    const resultHash = crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex');
    const maskedSample = rows.slice(0, 100); // Allow up to 100 rows for visualization
    const resultMetadata = { rowCount, columns, resultHash };

    return {
      isModification: false,
      executionMetadata: resultMetadata,
      maskedSample: maskedSample,
    };

  } catch (error) {
    console.error('Error during SQL execution:', error.message);
    return { error: 'Failed to execute query.', details: error.message };
  } finally {
    client.release();
  }
}

module.exports = {
  executeSql,
};