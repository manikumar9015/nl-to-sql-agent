const fs = require("fs");
const path = require("path");
const { generateText } = require("../services/aiClient");

const promptTemplate = fs.readFileSync(
  path.join(__dirname, "../prompts/visualization.prompt.txt"),
  "utf-8"
);

/**
 * Creates a visualization package from execution results.
 * @param {string} userPrompt The original user question.
 * @param {string} generatedSql The SQL that was executed.
 * @param {object} executionMetadata Metadata from the sql_executor.
 * @param {Array<object>} maskedSample A sample of the result data.
 * @param {Array<object>} conversationHistory Conversation turns.
 * @returns {Promise<object>} A visualization package (visPackage).
 */
async function createVisualization(
  userPrompt,
  generatedSql,
  executionMetadata,
  maskedSample,
  conversationHistory = []
) {
  // Don't generate a chart if there's no data.
  if (!maskedSample || maskedSample.length === 0) {
    return {
      type: "scalar",
      visSpec: { title: "No Results" },
      summary: "The query returned no results.",
    };
  }

  const sensitiveColumns = ["email", "phone", "ssn", "first_name", "last_name"];
  const sanitizedSample = maskedSample.map((row) => {
    const newRow = { ...row };
    for (const col of sensitiveColumns) {
      if (newRow[col] !== undefined) {
        newRow[col] = `{{${col.toUpperCase()}}}`; // placeholder format
      }
    }
    return newRow;
  });

  const historyString = conversationHistory
    .map((turn) => `${turn.sender === "user" ? "User" : "Bot"}: ${turn.text}`)
    .join("\n");

  let finalPrompt = promptTemplate.replace("{prompt}", userPrompt);
  finalPrompt = finalPrompt.replace("{sql}", generatedSql);
  finalPrompt = finalPrompt.replace("{history}", historyString);
  finalPrompt = finalPrompt.replace(
    "{columns}",
    executionMetadata.columns.join(", ")
  );
  finalPrompt = finalPrompt.replace("{rowCount}", executionMetadata.rowCount);
  finalPrompt = finalPrompt.replace(
    "{sample}",
    JSON.stringify(sanitizedSample, null, 2)
  );

  console.log("--- Sending prompt to Visualization Agent ---");
  const visResponse = await generateText(finalPrompt);
  console.log("--- Visualization Agent Raw Response ---");
  console.log(visResponse);

  let visPackage;
  try {
    const cleanedJson = visResponse
      .replace(/```/g, "")
      .replace("json", "")
      .trim();
    visPackage = JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Failed to parse Visualization LLM response as JSON:", error);
    return {
      type: "table",
      visSpec: { title: "Query Results" },
      summary: "Could not automatically determine the best visualization.",
    };
  }

  // --- NEW LOGIC: Post-process the summary placeholders ---
  if (visPackage.summary) {
    let finalSummary = visPackage.summary;
    const placeholders = finalSummary.match(/\{\{[A-Z_]+\}\}/g) || [];

    // Use the first row of original (unsanitized) data
    const firstRow = maskedSample[0];

    for (const placeholder of placeholders) {
      const columnName = placeholder.replace(/\{|\}/g, "").toLowerCase();
      if (firstRow[columnName] !== undefined) {
        finalSummary = finalSummary.replace(placeholder, firstRow[columnName]);
      }
    }
    visPackage.summary = finalSummary;
  }
  // --- END NEW LOGIC ---

  return visPackage;
}

module.exports = {
  createVisualization,
};
