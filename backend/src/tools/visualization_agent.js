const fs = require('fs');
const path = require('path');
const { generateText } = require('../services/aiClient');

const promptTemplate = fs.readFileSync(
  path.join(__dirname, '../prompts/visualization.prompt.txt'),
  'utf-8'
);

/**
 * Creates a visualization package from execution results.
 * @param {string} userPrompt The original user question.
 * @param {object} executionMetadata Metadata from the sql_executor.
 * @param {Array<object>} maskedSample A sample of the result data.
 * @returns {Promise<object>} A visualization package (visPackage).
 */
async function createVisualization(userPrompt, executionMetadata, maskedSample, conversationHistory = []) {
  // Don't generate a chart if there's no data.
  if (!maskedSample || maskedSample.length === 0) {
    return {
      type: 'scalar',
      visSpec: { title: 'No Results', xAxisKey: null, yAxisKey: null },
      summary: 'The query returned no results.',
    };
  }

  const historyString = conversationHistory
    .map((turn) => `${turn.sender === "user" ? "User" : "Bot"}: ${turn.text}`)
    .join("\n");


  let finalPrompt = promptTemplate.replace('{prompt}', userPrompt);
  finalPrompt = finalPrompt.replace('{history}', historyString);
  finalPrompt = finalPrompt.replace('{columns}', executionMetadata.columns.join(', '));
  finalPrompt = finalPrompt.replace('{rowCount}', executionMetadata.rowCount);
  finalPrompt = finalPrompt.replace('{sample}', JSON.stringify(maskedSample, null, 2));

  console.log('--- Sending prompt to Visualization Agent ---');
  const visResponse = await generateText(finalPrompt);
  console.log('--- Visualization Agent Raw Response ---');
  console.log(visResponse);

  try {
    const cleanedJson = visResponse.replace(/```/g, '').replace('json', '').trim();
    const result = JSON.parse(cleanedJson);
    return result;
  } catch (error) {
    console.error('Failed to parse Visualization LLM response as JSON:', error);
    // Return a default "table" view if parsing fails
    return {
      type: 'table',
      visSpec: { title: 'Query Results', xAxisKey: null, yAxisKey: null },
      summary: 'Could not automatically determine the best visualization.',
    };
  }
}

module.exports = {
  createVisualization,
};