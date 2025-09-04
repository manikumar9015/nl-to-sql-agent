// Load environment variables from .env file
require("dotenv").config();
const cors = require("cors");
const express = require("express");

// --- Initialize Express App ---
const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// --- IMPORT ALL SERVICES AND TOOLS ---
const aiClient = require("./services/aiClient");
const dbManager = require("./services/dbPoolManager");
const schemaService = require("./services/schemaService");
const auditService = require("./services/auditService");

// --- AGENT BRAIN ---
const router = require("./agent/router");

// --- TOOLS ---
const sqlGenerator = require("./tools/sql_generator");
const sqlVerifier = require("./tools/sql_verifier");
const sqlExecutor = require("./tools/sql_executor");
const visualizationAgent = require("./tools/visualization_agent");
const generalConversation = require("./tools/general_conversation");
const resultInterpreter = require("./tools/result_interpreter");

// --- CONFIGURATION ---
const PORT = process.env.PORT || 3001;

// =================================================================
// --- API ROUTES ---
// =================================================================

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is running!" });
});

// AI test route
app.post("/api/ai-test", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }
    const aiResponse = await aiClient.generateText(prompt);
    res.json({ message: "AI response received successfully.", response: aiResponse });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
});

// Schema test route
app.get("/api/schema/:dbName", async (req, res) => {
  try {
    const { dbName } = req.params;
    const schema = await schemaService.getLiveDatabaseSchema(dbName);
    res.json(schema);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SQL Generation test route
app.post("/api/generate-sql", async (req, res) => {
  try {
    const { prompt, dbName } = req.body;
    if (!prompt || !dbName) {
      return res.status(400).json({ error: "Prompt and dbName are required." });
    }
    const sql = await sqlGenerator.generateSql(prompt, dbName);
    res.json({ prompt: prompt, database: dbName, generated_sql: sql });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PRIMARY AGENT ENDPOINT ---
app.post("/api/agent/chat", async (req, res) => {
  const { prompt, dbName, conversationHistory = [], lastResult = null } = req.body;
  if (!prompt || !dbName) {
    return res.status(400).json({ error: "Prompt and dbName are required." });
  }

  try {
    // 1. ROUTE
    const tool = await router.route(prompt, conversationHistory);
    console.log(`[ROUTER] Selected tool: ${tool}`);
    await auditService.logEvent({ action: "ROUTE_REQUEST", details: { prompt, tool } });

    // 2. EXECUTE THE SELECTED TOOL
    if (tool === "database_query") {
      console.log(`[PIPELINE] Starting... Prompt: "${prompt}"`);
      const generatedSql = await sqlGenerator.generateSql(prompt, dbName, conversationHistory);
      const verificationResult = await sqlVerifier.verifySql(prompt, generatedSql, dbName, conversationHistory);
      await auditService.logEvent({ action: "VERIFY_SQL", details: { generatedSql, ...verificationResult } });

      if (!verificationResult.is_safe) {
        return res.status(400).json({
          sender: "bot",
          text: `I'm sorry, I cannot run that query. Reason: ${verificationResult.reasoning}`,
          isError: true,
        });
      }

      const finalSql = verificationResult.corrected_sql || generatedSql;
      const executionResult = await sqlExecutor.executeSql(finalSql, dbName);
      await auditService.logEvent({ action: "EXECUTE_SQL", details: { sql: finalSql, resultHash: executionResult.executionMetadata?.resultHash }});

      if (executionResult.error) return res.status(500).json(executionResult);

      const visPackage = await visualizationAgent.createVisualization(prompt, executionResult.executionMetadata, executionResult.maskedSample, conversationHistory);
      res.json({ text: visPackage.summary, ...executionResult, visPackage, verifier_output: verificationResult });

    } else if (tool === "result_interpreter") {
      console.log(`[INTERPRETER] Starting... Prompt: "${prompt}"`);
      await auditService.logEvent({ action: "INTERPRET_RESULT", details: { prompt } });
      const interpretation = await resultInterpreter.interpretResult(prompt, conversationHistory, lastResult);
      res.json({ text: interpretation });

    } else { // Defaults to general_conversation
      console.log(`[CONVERSATION] Starting... Prompt: "${prompt}"`);
      await auditService.logEvent({ action: "GENERAL_CONVERSATION", details: { prompt } });
      const conversationalResponse = await generalConversation.handleConversation(prompt, conversationHistory);
      res.json({ text: conversationalResponse });
    }
  } catch (error) {
    console.error("--- INTERNAL SERVER ERROR ---", error);
    res.status(500).json({ text: "An unexpected error occurred.", error: error.message, isError: true });
  }
});

// Admin endpoint to view audit logs
app.get("/api/admin/audit-logs", async (req, res) => {
  try {
    const db = dbManager.getMongoDb();
    const logs = await db.collection("audit_logs").find().sort({ timestamp: -1 }).limit(20).toArray();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve audit logs.", details: error.message });
  }
});

// =================================================================
// --- Server Startup ---
// =================================================================
(async () => {
  await dbManager.connectToMongo();
  app.listen(PORT, () => {
    console.log(`Backend server is listening on http://localhost:${PORT}`);
  });
})();