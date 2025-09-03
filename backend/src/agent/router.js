const fs = require("fs");
const path = require("path");
const { generateText } = require("../services/aiClient");

const promptTemplate = fs.readFileSync(
  path.join(__dirname, "../prompts/router.prompt.txt"),
  "utf-8"
);

async function route(userPrompt, conversationHistory = []) {

  const historyString = conversationHistory
    .map((turn) => `${turn.sender === "user" ? "User" : "Bot"}: ${turn.text}`)
    .join("\n");

  let finalPrompt = promptTemplate.replace('{history}', historyString);
  finalPrompt = finalPrompt.replace('{prompt}', userPrompt);

  console.log("--- Sending prompt to Router ---");
  const routerResponse = await generateText(finalPrompt);
  console.log("--- Router Raw Response ---", routerResponse);

  try {
    const cleanedJson = routerResponse
      .replace(/```/g, "")
      .replace("json", "")
      .trim();
    const result = JSON.parse(cleanedJson);
    return result.tool; // e.g., "database_query" or "general_conversation"
  } catch (error) {
    console.error("Failed to parse Router response as JSON:", error);
    return "general_conversation"; // Default to conversation on failure
  }
}

module.exports = { route };
