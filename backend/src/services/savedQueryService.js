const { getMongoDb } = require('./dbPoolManager');
const { getDbPool } = require('./dbPoolManager');
const { ObjectId } = require('mongodb');

const SAVED_QUERIES_COLLECTION = 'saved_queries';

/**
 * Saves a query for reuse.
 * @param {string} userId - The user ID
 * @param {string} name - Query name
 * @param {string} sql - The SQL query
 * @param {string} dbName - Database name
 * @param {string} visualizationType - Type of visualization (table, bar, line, pie, metric)
 * @returns {Promise<Object>} The saved query
 */
async function saveQuery(userId, name, sql, dbName, visualizationType) {
  const db = getMongoDb();
  const newQuery = {
    userId: new ObjectId(userId),
    name,
    sql,
    dbName,
    visualizationType,
    createdAt: new Date(),
  };

  const result = await db.collection(SAVED_QUERIES_COLLECTION).insertOne(newQuery);
  return { ...newQuery, _id: result.insertedId };
}

/**
 * Gets all saved queries for a user.
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of saved queries
 */
async function getSavedQueries(userId) {
  const db = getMongoDb();
  const queries = await db
    .collection(SAVED_QUERIES_COLLECTION)
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray();
  return queries;
}

/**
 * Gets a specific saved query by ID.
 * @param {string} queryId - The query ID
 * @param {string} userId - The user ID (for authorization)
 * @returns {Promise<Object|null>} The saved query or null
 */
async function getSavedQueryById(queryId, userId) {
  const db = getMongoDb();
  const query = await db.collection(SAVED_QUERIES_COLLECTION).findOne({
    _id: new ObjectId(queryId),
    userId: new ObjectId(userId),
  });
  return query;
}

/**
 * Executes a saved query and returns fresh data.
 * @param {string} queryId - The query ID
 * @param {string} userId - The user ID (for authorization)
 * @returns {Promise<Object>} Query execution results
 */
async function executeQuery(queryId, userId) {
  const query = await getSavedQueryById(queryId, userId);
  
  if (!query) {
    throw new Error('Saved query not found');
  }

  const pool = getDbPool(query.dbName);
  const client = await pool.connect();

  try {
    const result = await client.query(query.sql);
    const { rows, rowCount } = result;
    const columns = result.fields.map(field => field.name);

    return {
      rows,
      rowCount,
      columns,
      queryId,
      visualizationType: query.visualizationType,
    };
  } catch (error) {
    console.error('Error executing saved query:', error);
    throw new Error('Failed to execute query: ' + error.message);
  } finally {
    client.release();
  }
}

/**
 * Deletes a saved query.
 * @param {string} queryId - The query ID
 * @param {string} userId - The user ID (for authorization)
 * @returns {Promise<Object>} Delete result
 */
async function deleteSavedQuery(queryId, userId) {
  const db = getMongoDb();
  const result = await db.collection(SAVED_QUERIES_COLLECTION).deleteOne({
    _id: new ObjectId(queryId),
    userId: new ObjectId(userId),
  });
  return result;
}

module.exports = {
  saveQuery,
  getSavedQueries,
  getSavedQueryById,
  executeQuery,
  deleteSavedQuery,
};
