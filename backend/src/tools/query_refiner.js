const fs = require('fs');
const path = require('path');
const { generateText } = require('../services/aiClient');
const { getLiveDatabaseSchema } = require('../services/schemaService');

const promptTemplate = fs.readFileSync(
  path.join(__dirname, '../prompts/query_refiner.prompt.txt'),
  'utf-8'
);

/**
 * Refines an existing SQL query based on user's modification request.
 * This is more efficient than regenerating the entire query from scratch.
 * @param {string} userPrompt The user's refinement request (e.g., "Only from California")
 * @param {string} previousSql The SQL query to modify
 * @param {string} dbName The database name for schema context
 * @param {Array} conversationHistory Recent conversation for context
 * @returns {Promise<Object>} { sql: string, explanation: string, wasModified: boolean }
 */
async function refineSql(userPrompt, previousSql, dbName, conversationHistory = []) {
  console.log('[QUERY REFINER] Attempting to refine SQL...');
  console.log(`[QUERY REFINER] Previous SQL: ${previousSql}`);
  console.log(`[QUERY REFINER] User request: ${userPrompt}`);

  // Get schema for context
  const schemaString = await getLiveDatabaseSchema(dbName);

  // Build conversation history string
  const historyString = conversationHistory
    .map((turn) => `${turn.sender === "user" ? "User" : "Bot"}: ${turn.text}`)
    .join("\n");

  // Replace placeholders in prompt
  let finalPrompt = promptTemplate
    .replace('{schema}', schemaString)
    .replace('{history}', historyString)
    .replace('{previous_sql}', previousSql)
    .replace('{modification_request}', userPrompt);

  console.log('[QUERY REFINER] Sending refinement request to AI...');
  const response = await generateText(finalPrompt);

  try {
    // Parse the JSON response
    const cleanedJson = response
      .replace(/```/g, "")
      .replace("json", "")
      .trim();
    const result = JSON.parse(cleanedJson);

    console.log(`[QUERY REFINER] Success: ${result.was_modified ? 'Modified' : 'Regenerate needed'}`);
    
    return {
      sql: result.modified_sql,
      explanation: result.explanation,
      wasModified: result.was_modified,
    };
  } catch (error) {
    console.error('[QUERY REFINER] Failed to parse response:', error);
    // On parse error, signal that full regeneration is needed
    return {
      sql: null,
      explanation: 'Could not refine query. Will regenerate from scratch.',
      wasModified: false,
    };
  }
}

module.exports = {
  refineSql,
};
