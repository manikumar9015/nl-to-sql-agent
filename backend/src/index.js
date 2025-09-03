// Load environment variables from .env file
require('dotenv').config();
const cors = require('cors');

const express = require('express');
const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// --- IMPORT ALL SERVICES AND TOOLS ---
const aiClient = require('./services/aiClient');
const dbManager = require('./services/dbPoolManager');
const schemaService = require('./services/schemaService');

// --- AGENT BRAIN ---
const router = require('./agent/router');

// --- TOOLS ---
const sqlGenerator = require('./tools/sql_generator');
const sqlVerifier = require('./tools/sql_verifier');
const sqlExecutor = require('./tools/sql_executor');
const visualizationAgent = require('./tools/visualization_agent');
const generalConversation = require('./tools/general_conversation');
const resultInterpreter = require('./tools/result_interpreter'); // Make sure this is imported

const PORT = process.env.PORT || 3001;

// --- API ROUTES ---

// Health check route and other test routes can remain as they are
app.get('/api/health', (req, res) => { /* ... */ });
app.post('/api/ai-test', async (req, res) => { /* ... */ });
app.get('/api/schema/:dbName', async (req, res) => { /* ... */ });
app.post('/api/generate-sql', async (req, res) => { /* ... */ });


// --- THIS IS THE FINAL, FULLY UPDATED ENDPOINT ---
app.post('/api/agent/chat', async (req, res) => {
  // <-- RECEIVE lastResult from the request body
  const { prompt, dbName, conversationHistory = [], lastResult = null } = req.body;
  if (!prompt || !dbName) {
    return res.status(400).json({ error: 'Prompt and dbName are required.' });
  }

  try {
    // --- 1. ROUTE ---
    const tool = await router.route(prompt, conversationHistory);
    console.log(`[ROUTER] Selected tool: ${tool}`);

    // --- 2. EXECUTE THE SELECTED TOOL ---
    if (tool === 'database_query') {
      console.log(`[PIPELINE] Starting... Prompt: "${prompt}"`);
      
      const generatedSql = await sqlGenerator.generateSql(prompt, dbName, conversationHistory);
      const verificationResult = await sqlVerifier.verifySql(prompt, generatedSql, dbName, conversationHistory);

      if (!verificationResult.is_safe) {
        return res.status(400).json({ 
          sender: 'bot',
          text: `I'm sorry, I cannot run that query. Reason: ${verificationResult.reasoning}`,
          isError: true
        });
      }

      const finalSql = verificationResult.corrected_sql || generatedSql;
      const executionResult = await sqlExecutor.executeSql(finalSql, dbName);

      if (executionResult.error) return res.status(500).json(executionResult);

      const visPackage = await visualizationAgent.createVisualization(prompt, executionResult.executionMetadata, executionResult.maskedSample, conversationHistory);
      
      res.json({
        text: visPackage.summary,
        ...executionResult,
        visPackage,
        verifier_output: verificationResult,
      });

    } else if (tool === 'result_interpreter') { // <-- ADD NEW LOGIC PATH
      console.log(`[INTERPRETER] Starting... Prompt: "${prompt}"`);
      const interpretation = await resultInterpreter.interpretResult(prompt, conversationHistory, lastResult);
      res.json({
        text: interpretation, // The response is purely conversational
      });

    } else { // Defaults to general_conversation
      console.log(`[CONVERSATION] Starting... Prompt: "${prompt}"`);
      const conversationalResponse = await generalConversation.handleConversation(prompt, conversationHistory);
      res.json({
        text: conversationalResponse
      });
    }

  } catch (error) {
    console.error("--- INTERNAL SERVER ERROR ---");
    console.error(error);
    console.error("---------------------------");
    res.status(500).json({ text: 'An unexpected error occurred.', error: error.message, isError: true });
  }
});


// --- Server Startup ---
(async () => {
  await dbManager.connectToMongo();
  app.listen(PORT, () => {
    console.log(`Backend server is listening on http://localhost:${PORT}`);
  });
})();