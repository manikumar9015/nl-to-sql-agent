/**
 * Schema Designer Tool
 * AI-powered conversational database schema design
 */

const fs = require('fs');
const path = require('path');
const { generateText } = require('../services/aiClient');
const { validateSchema } = require('../utils/schema_validator');

const promptTemplate = fs.readFileSync(
  path.join(__dirname, '../prompts/schema_designer.prompt.txt'),
  'utf-8'
);

/**
 * Design or refine a database schema through AI conversation
 * @param {string} userMessage - User's latest message
 * @param {Object|null} currentSchema - Current schema state (null if starting fresh)
 * @param {Array} conversationHistory - Previous messages in this schema design session
 * @returns {Promise<Object>} Schema design response
 */
async function designSchema(userMessage, currentSchema = null, conversationHistory = []) {
  try {
    // Prepare the prompt
    const schemaString = currentSchema 
      ? JSON.stringify(currentSchema, null, 2)
      : 'No schema yet - starting fresh';
    
    const historyString = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
    
    let prompt = promptTemplate
      .replace('{current_schema}', schemaString)
      .replace('{history}', historyString || 'No previous conversation')
      .replace('{user_message}', userMessage);
    
    console.log('--- Sending prompt to Schema Designer AI ---');
    
    // Get AI response
    const aiResponse = await generateText(prompt);
    
    console.log('--- Schema Designer AI Response ---');
    console.log(aiResponse);
    
    // Parse the JSON response
    let result;
    try {
      // Clean up the response (remove markdown code blocks if present)
      const cleanedResponse = aiResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      result = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse Schema Designer response:', parseError);
      console.error('Raw response:', aiResponse);
      
      // Return a fallback response
      return {
        schema: currentSchema || { tables: [] },
        explanation: "I had trouble processing that request. Could you please rephrase?",
        isComplete: false,
        needsClarification: "Could you provide more details about what you'd like to add or change?",
        suggestions: []
      };
    }
    
    // Validate the schema if it has tables
    if (result.schema && result.schema.tables && result.schema.tables.length > 0) {
      try {
        validateSchema(result.schema);
        console.log('✓ Schema validation passed');
      } catch (validationError) {
        console.warn('Schema validation warning:', validationError.message);
        // Add validation warning to explanation
        result.explanation += `\n\nNote: ${validationError.message}`;
        result.isComplete = false;
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('Error in schema designer:', error);
    throw error;
  }
}

/**
 * Generate a simple visualization of the schema
 * @param {Object} schema - Schema to visualize
 * @returns {string} Text visualization
 */
function visualizeSchema(schema) {
  if (!schema || !schema.tables || schema.tables.length === 0) {
    return 'No tables defined yet.';
  }
  
  const lines = [];
  
  schema.tables.forEach(table => {
    lines.push(`\n📋 TABLE: ${table.name}`);
    lines.push('─'.repeat(50));
    
    table.columns.forEach(column => {
      let line = `  • ${column.name}: ${column.type}`;
      
      const attributes = [];
      if (column.primaryKey) attributes.push('PK');
      if (column.unique) attributes.push('UNIQUE');
      if (column.nullable === false) attributes.push('NOT NULL');
      if (column.foreignKey) attributes.push(`FK→${column.foreignKey.table}`);
      
      if (attributes.length > 0) {
        line += ` [${attributes.join(', ')}]`;
      }
      
      lines.push(line);
    });
  });
  
  return lines.join('\n');
}

module.exports = {
  designSchema,
  visualizeSchema,
};
