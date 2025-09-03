const fs = require("fs");
const path = require("path");
const { generateText } = require("../services/aiClient");
const { getLiveDatabaseSchema } = require("../services/schemaService");

const promptTemplate = fs.readFileSync(
  path.join(__dirname, "../prompts/sql_generator.prompt.txt"),
  "utf-8"
);

async function generateSql(userPrompt, dbName, conversationHistory = []) {
  // 1. Fetch the new, detailed schema string
  const schemaString = await getLiveDatabaseSchema(dbName);

  const historyString = conversationHistory
    .map((turn) => `${turn.sender === "user" ? "User" : "Bot"}: ${turn.text}`)
    .join("\n");

  // 2. Format the prompt
  let finalPrompt = promptTemplate.replace("{schema}", schemaString);
  finalPrompt = finalPrompt.replace("{history}", historyString);
  finalPrompt = finalPrompt.replace("{prompt}", userPrompt);

  console.log("--- Sending prompt to SQL Generator ---");
  console.log(finalPrompt);
  console.log("------------------------------------");

  // 3. Call the AI client
  const generatedSql = await generateText(finalPrompt);

  // 4. Cleanup
  const cleanedSql = generatedSql.replace(/```/g, "").replace("sql", "").trim();
  return cleanedSql;
}

module.exports = {
  generateSql,
};
