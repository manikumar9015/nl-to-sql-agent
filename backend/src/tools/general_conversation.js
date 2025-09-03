const fs = require('fs');
const path = require('path');
const { generateText } = require('../services/aiClient');

const promptTemplate = fs.readFileSync(
  path.join(__dirname, '../prompts/general_conversation.prompt.txt'),
  'utf-8'
);

async function handleConversation(userPrompt, conversationHistory = []) {
  const historyString = conversationHistory
    .map((turn) => `${turn.sender === "user" ? "User" : "Bot"}: ${turn.text}`)
    .join("\n");

  // Replace both placeholders in sequence
  let finalPrompt = promptTemplate
    .replace('{history}', historyString)
    .replace('{prompt}', userPrompt);

  const response = await generateText(finalPrompt);
  return response;
}

module.exports = {
  handleConversation,
};
