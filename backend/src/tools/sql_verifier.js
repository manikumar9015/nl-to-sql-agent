const fs = require('fs');
const path = require('path');
const { generateText } = require('../services/aiClient');
const { getLiveDatabaseSchema } = require('../services/schemaService');

const promptTemplate = fs.readFileSync(
  path.join(__dirname, '../prompts/sql_verifier.prompt.txt'),
  'utf-8'
);

async function verifySql(userPrompt, generatedSql, dbName, conversationHistory = []) {
  // 1. Fetch the new, detailed schema string
  const schemaString = await getLiveDatabaseSchema(dbName);

  const historyString = conversationHistory
    .map((turn) => `${turn.sender === "user" ? "User" : "Bot"}: ${turn.text}`)
    .join("\n");

  // 2. Format the prompt
  let finalPrompt = promptTemplate.replace('{schema}', schemaString);
  finalPrompt = finalPrompt.replace('{history}', historyString);
  finalPrompt = finalPrompt.replace('{prompt}', userPrompt);
  finalPrompt = finalPrompt.replace('{sql}', generatedSql);

  console.log('--- Sending prompt to SQL Verifier ---');
  const verifierResponse = await generateText(finalPrompt);
  console.log('--- Verifier Raw Response ---');
  console.log(verifierResponse);

  try {
    const cleanedJson = verifierResponse.replace(/```/g, '').replace('json', '').trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error('Failed to parse Verifier LLM response as JSON:', error);
    return { is_safe: false, reasoning: 'Verifier AI returned a malformed response.', corrected_sql: generatedSql };
  }
}

module.exports = {
  verifySql,
};