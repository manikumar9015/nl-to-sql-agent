// Load environment variables from .env file
require("dotenv").config();
const cors = require("cors");
const express = require("express");


// --- Initialize Express App ---
const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// --- IMPORT ALL SERVICES AND TOOLS ---
const authService = require('./services/authService');
const aiClient = require("./services/aiClient");
const dbManager = require("./services/dbPoolManager");
const schemaService = require("./services/schemaService");
const auditService = require("./services/auditService");
const conversationService = require('./services/conversationService');
const authMiddleware = require('./middleware/authMiddleware');

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


// ----Agent endpoint----

app.post('/api/agent/chat', authMiddleware, async (req, res) => {
  // Destructure conversationId from the body now
  let { conversationId, prompt, dbName, conversationHistory = [], lastResult = null } = req.body;
  const userId = req.user.userId; // Get userId from the token via authMiddleware

  if (!prompt || !dbName) {
    return res.status(400).json({ error: 'Prompt and dbName are required.' });
  }

  try {
    let currentConversation;

    // If no conversationId is provided, this is the first message of a new chat.
    if (!conversationId) {
      console.log(`[CONVO] Creating new conversation for user ${userId}`);
      currentConversation = await conversationService.createConversation(userId, dbName);
      conversationId = currentConversation._id.toString();
      await auditService.logEvent({ action: "CREATE_CONVERSATION", userId, conversationId, details: { dbName } });
    }

    // Add the user's message to the database
    const userMessage = { sender: 'user', text: prompt };
    await conversationService.addMessageToConversation(conversationId, userMessage);
    await auditService.logEvent({ action: "ADD_MESSAGE", userId, conversationId, details: { sender: 'user', prompt } });

    // --- 1. ROUTE ---
    const tool = await router.route(prompt, conversationHistory);
    console.log(`[ROUTER] Selected tool: ${tool}`);
    await auditService.logEvent({ action: "ROUTE_REQUEST", userId, conversationId, details: { prompt, tool } });

    // --- 2. EXECUTE THE SELECTED TOOL ---
    let botMessage = {}; // Initialize a variable to hold the bot's response

    if (tool === 'database_query') {
      console.log(`[PIPELINE] Starting... Prompt: "${prompt}"`);
      const generatedSql = await sqlGenerator.generateSql(prompt, dbName, conversationHistory);
      const verificationResult = await sqlVerifier.verifySql(prompt, generatedSql, dbName, conversationHistory);
      await auditService.logEvent({ action: "VERIFY_SQL", userId, conversationId, details: { generatedSql, ...verificationResult } });

      if (!verificationResult.is_safe) {
        botMessage = { text: `I'm sorry, I cannot run that query. Reason: ${verificationResult.reasoning}`, isError: true };
      } else {
        const finalSql = verificationResult.corrected_sql || generatedSql;
        const executionResult = await sqlExecutor.executeSql(finalSql, dbName);
        await auditService.logEvent({ action: "EXECUTE_SQL", userId, conversationId, details: { sql: finalSql, resultHash: executionResult.executionMetadata?.resultHash }});

        if (executionResult.error) {
           // Create an error bot message instead of returning a 500
           botMessage = { text: 'Sorry, the query failed to execute.', isError: true };
        } else {
           const visPackage = await visualizationAgent.createVisualization(prompt, executionResult.executionMetadata, executionResult.maskedSample, conversationHistory);
           botMessage = { text: visPackage.summary, ...executionResult, visPackage, verifier_output: verificationResult };
        }
      }
    } else if (tool === 'result_interpreter') {
      console.log(`[INTERPRETER] Starting... Prompt: "${prompt}"`);
      await auditService.logEvent({ action: "INTERPRET_RESULT", userId, conversationId, details: { prompt } });
      const interpretation = await resultInterpreter.interpretResult(prompt, conversationHistory, lastResult);
      botMessage = { text: interpretation };

    } else { // Defaults to general_conversation
      console.log(`[CONVERSATION] Starting... Prompt: "${prompt}"`);
      await auditService.logEvent({ action: "GENERAL_CONVERSATION", userId, conversationId, details: { prompt } });
      const conversationalResponse = await generalConversation.handleConversation(prompt, conversationHistory);
      botMessage = { text: conversationalResponse };
    }

    // Add the sender:'bot' property to the final message
    const finalBotMessage = { sender: 'bot', ...botMessage };

    // --- 3. SAVE BOT'S RESPONSE & SEND ---
    await conversationService.addMessageToConversation(conversationId, finalBotMessage);
    await auditService.logEvent({ action: "ADD_MESSAGE", userId, conversationId, details: { sender: 'bot', text: finalBotMessage.text } });

    // Include the conversationId in the final response to the frontend
    res.json({ conversationId, ...finalBotMessage });

  } catch (error) {
    console.error("--- INTERNAL SERVER ERROR ---", error);
    res.status(500).json({ text: 'An unexpected error occurred.', error: error.message, isError: true });
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

// --- AUTHENTICATION ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }
    const result = await authService.registerUser(username, password, role);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }
    const result = await authService.loginUser(username, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});


// Get a list of all conversations for the logged-in user
app.get('/api/conversations', authMiddleware, async (req, res) => {
  try {
    const conversations = await conversationService.getConversationsForUser(req.user.userId);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
});

// Get a single conversation by its ID
app.get('/api/conversations/:id', authMiddleware, async (req, res) => {
    try {
        const conversation = await conversationService.getConversationById(req.params.id, req.user.userId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found.' });
        }
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch conversation.' });
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