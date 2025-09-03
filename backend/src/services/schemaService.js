const { getDbPool } = require('./dbPoolManager');

/**
 * Fetches a detailed schema for a given database, including tables and their columns.
 * @param {string} dbName The identifier for the database (e.g., 'sales_db').
 * @returns {Promise<string>} A formatted string describing the database schema.
 */
async function getLiveDatabaseSchema(dbName) {
  console.log(`Fetching detailed schema for database: ${dbName}`);
  const pool = getDbPool(dbName);

  try {
    // This query gets all user-defined tables and their columns from the information_schema.
    const query = `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;
    const result = await pool.query(query);

    // Group columns by table
    const schema = result.rows.reduce((acc, { table_name, column_name }) => {
      if (!acc[table_name]) {
        acc[table_name] = [];
      }
      acc[table_name].push(column_name);
      return acc;
    }, {});

    // Format the schema into a string for the LLM prompt
    let schemaString = '';
    for (const tableName in schema) {
      schemaString += `Table "${tableName}" has columns: ${schema[tableName].join(', ')}.\n`;
    }

    return schemaString.trim();

  } catch (error) {
    console.error(`Error fetching detailed schema for ${dbName}:`, error);
    throw new Error('Could not fetch database schema.');
  }
}

module.exports = {
  getLiveDatabaseSchema,
};