const fs = require('fs');
const path = require('path');
const { generateText } = require('../services/aiClient');

const promptTemplate = fs.readFileSync(
  path.join(__dirname, '../prompts/result_interpreter.prompt.txt'),
  'utf-8'
);

async function interpretResult(userPrompt, conversationHistory = [], lastResult = null) {
  if (!lastResult) {
    return "I'm sorry, there are no previous results to analyze. Please ask a new question to fetch some data first.";
  }

  const historyString = conversationHistory
    .map(turn => `${turn.sender === 'user' ? 'User' : 'Bot'}: ${turn.text}`)
    .join('\n');

  // Format the last result data into a clean string for the prompt
  const lastResultString = JSON.stringify({
    metadata: lastResult.executionMetadata,
    dataSample: lastResult.maskedSample,
  }, null, 2);

  let finalPrompt = promptTemplate.replace('{history}', historyString);
  finalPrompt = finalPrompt.replace('{lastResult}', lastResultString);
  finalPrompt = finalPrompt.replace('{prompt}', userPrompt);

  console.log('--- Sending prompt to Result Interpreter ---');
  const response = await generateText(finalPrompt);
  return response;
}

module.exports = {
  interpretResult,
};