/**
 * Agent Controller
 * Handles all agent-related endpoints including chat, AI tests, schema, and SQL generation
 */

const router = require('../agent/router');
const aiClient = require('../services/aiClient');
const schemaService = require('../services/schemaService');
const auditService = require('../services/auditService');
const conversationService = require('../services/conversationService');
const sqlGenerator = require('../tools/sql_generator');
const sqlVerifier = require('../tools/sql_verifier');
const sqlExecutor = require('../tools/sql_executor');
const visualizationAgent = require('../tools/visualization_agent');
const generalConversation = require('../tools/general_conversation');
const resultInterpreter = require('../tools/result_interpreter');
const queryRefiner = require('../tools/query_refiner');
const { TOOLS, AUDIT_ACTIONS, SQL_VERSION_TYPES } = require('../constants');

/**
 * Health check endpoint
 */
const getHealthCheck = (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running!' });
};

/**
 * AI test endpoint
 */
const testAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }
    const aiResponse = await aiClient.generateText(prompt);
    res.json({
      message: 'AI response received successfully.',
      response: aiResponse,
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
};

/**
 * Get database schema
 */
const getSchema = async (req, res) => {
  try {
    const { dbName } = req.params;
    const schema = await schemaService.getLiveDatabaseSchema(dbName);
    res.json(schema);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Generate SQL from prompt (test endpoint)
 */
const generateSQL = async (req, res) => {
  try {
    const { prompt, dbName } = req.body;
    if (!prompt || !dbName) {
      return res.status(400).json({ error: 'Prompt and dbName are required.' });
    }
    const sql = await sqlGenerator.generateSql(prompt, dbName);
    res.json({ prompt: prompt, database: dbName, generated_sql: sql });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Main agent chat endpoint with query refinement support
 */
const handleAgentChat = async (req, res) => {
  let {
    conversationId,
    prompt,
    dbName,
    conversationHistory = [],
    lastResult = null,
  } = req.body;
  const userId = req.user.userId;

  if (!prompt || !dbName) {
    return res.status(400).json({ error: 'Prompt and dbName are required.' });
  }

  try {
    // If no conversationId, create a new one
    if (!conversationId) {
      const newConversation = await conversationService.createConversation(userId, dbName);
      conversationId = newConversation._id.toString();
    }

    const userMessage = { sender: 'user', text: prompt };
    await conversationService.addMessageToConversation(conversationId, userMessage);
    await auditService.logEvent({
      action: AUDIT_ACTIONS.ADD_MESSAGE,
      userId,
      conversationId,
      details: { sender: 'user', prompt },
    });

    // 1. ROUTE
    const tool = await router.route(prompt, conversationHistory);
    await auditService.logEvent({
      action: AUDIT_ACTIONS.ROUTE_REQUEST,
      userId,
      conversationId,
      details: { prompt, tool },
    });

    // 2. EXECUTE THE SELECTED TOOL
    let botMessagePayload = {};

    // QUERY REFINEMENT HANDLER
    if (tool === TOOLS.QUERY_REFINEMENT) {
      const lastSqlData = await conversationService.getLastExecutedSql(conversationId);
      
      if (!lastSqlData || !lastSqlData.sql) {
        botMessagePayload = { text: "I don't have a previous query to refine. Please run a query first." };
      } else {
        console.log('[REFINEMENT] Attempting to refine previous SQL...');
        const refinementResult = await queryRefiner.refineSql(
          prompt,
          lastSqlData.sql,
          dbName,
          conversationHistory
        );

        if (!refinementResult.wasModified) {
          // Refinement failed, fall back to full generation
          console.log('[REFINEMENT] Refinement not possible, falling back to full generation');
          const generatedSql = await sqlGenerator.generateSql(prompt, dbName, conversationHistory);
          const verificationResult = await sqlVerifier.verifySql(prompt, generatedSql, dbName, conversationHistory);
          
          await auditService.logEvent({
            action: AUDIT_ACTIONS.VERIFY_SQL,
            userId,
            conversationId,
            details: { generatedSql, ...verificationResult },
          });

          if (!verificationResult.is_safe) {
            botMessagePayload = {
              text: `I'm sorry, I cannot run that query. Reason: ${verificationResult.reasoning}`,
              isError: true,
            };
          } else {
            const finalSql = verificationResult.corrected_sql || generatedSql;
            const executionResult = await sqlExecutor.executeSql(finalSql, dbName, req.user);
            
            await auditService.logEvent({
              action: AUDIT_ACTIONS.EXECUTE_SQL,
              userId,
              conversationId,
              details: { sql: finalSql, resultHash: executionResult.executionMetadata?.resultHash },
            });

            if (executionResult.error) {
              botMessagePayload = { text: 'Sorry, the query failed to execute.', isError: true };
            } else if (executionResult.isModification) {
              const { rowCount, operation } = executionResult.executionMetadata;
              botMessagePayload = { text: `Successfully executed ${operation}. ${rowCount} row(s) were affected.` };
            } else {
              const visPackage = await visualizationAgent.createVisualization(
                prompt,
                finalSql,
                executionResult.executionMetadata,
                executionResult.maskedSample,
                conversationHistory
              );

              botMessagePayload = {
                text: visPackage.summary,
                ...executionResult,
                visPackage,
                verifier_output: verificationResult,
              };

              await conversationService.addSqlVersion(conversationId, finalSql, SQL_VERSION_TYPES.REGENERATED);
            }
          }
        } else {
          // Refinement succeeded
          console.log(`[REFINEMENT] Successfully refined SQL: ${refinementResult.sql}`);
          const refinedSql = refinementResult.sql;
          const verificationResult = await sqlVerifier.verifySql(prompt, refinedSql, dbName, conversationHistory);

          await auditService.logEvent({
            action: AUDIT_ACTIONS.VERIFY_SQL,
            userId,
            conversationId,
            details: { refinedSql, ...verificationResult },
          });

          if (!verificationResult.is_safe) {
            botMessagePayload = {
              text: `The refined query doesn't look safe. Reason: ${verificationResult.reasoning}`,
              isError: true,
            };
          } else {
            const finalSql = verificationResult.corrected_sql || refinedSql;
            const executionResult = await sqlExecutor.executeSql(finalSql, dbName, req.user);

            await auditService.logEvent({
              action: AUDIT_ACTIONS.EXECUTE_SQL,
              userId,
              conversationId,
              details: { sql: finalSql, resultHash: executionResult.executionMetadata?.resultHash },
            });

            if (executionResult.error) {
              botMessagePayload = { text: 'Sorry, the query failed to execute.', isError: true };
            } else if (executionResult.isModification) {
              const { rowCount, operation } = executionResult.executionMetadata;
              botMessagePayload = { text: `Successfully executed ${operation}. ${rowCount} row(s) were affected.` };
            } else {
              const visPackage = await visualizationAgent.createVisualization(
                prompt,
                finalSql,
                executionResult.executionMetadata,
                executionResult.maskedSample,
                conversationHistory
              );

              botMessagePayload = {
                text: `${refinementResult.explanation}\n\n${visPackage.summary}`,
                ...executionResult,
                visPackage,
                verifier_output: verificationResult,
                wasRefined: true,
              };

              await conversationService.addSqlVersion(conversationId, finalSql, refinementResult.explanation);
            }
          }
        }
      }
    } else if (tool === TOOLS.DATABASE_QUERY) {
      const generatedSql = await sqlGenerator.generateSql(prompt, dbName, conversationHistory);
      const verificationResult = await sqlVerifier.verifySql(prompt, generatedSql, dbName, conversationHistory);
      
      await auditService.logEvent({
        action: AUDIT_ACTIONS.VERIFY_SQL,
        userId,
        conversationId,
        details: { generatedSql, ...verificationResult },
      });

      if (!verificationResult.is_safe) {
        botMessagePayload = {
          text: `I'm sorry, I cannot run that query. Reason: ${verificationResult.reasoning}`,
          isError: true,
        };
      } else {
        const finalSql = verificationResult.corrected_sql || generatedSql;
        const executionResult = await sqlExecutor.executeSql(finalSql, dbName, req.user);
        
        await auditService.logEvent({
          action: AUDIT_ACTIONS.EXECUTE_SQL,
          userId,
          conversationId,
          details: { sql: finalSql, resultHash: executionResult.executionMetadata?.resultHash },
        });

        if (executionResult.error) {
          botMessagePayload = { text: 'Sorry, the query failed to execute.', isError: true };
        } else if (executionResult.isModification) {
          const { rowCount, operation } = executionResult.executionMetadata;
          const summary = `Successfully executed ${operation}. ${rowCount} row(s) were affected.`;
          botMessagePayload = { text: summary };
        } else {
          const visPackage = await visualizationAgent.createVisualization(
            prompt,
            finalSql,
            executionResult.executionMetadata,
            executionResult.maskedSample,
            conversationHistory
          );

          console.log('--- [DEBUG] DATA SENT TO FRONTEND ---');
          console.log('MASKED SAMPLE:', JSON.stringify(executionResult.maskedSample, null, 2));
          console.log('VIS PACKAGE:', JSON.stringify(visPackage, null, 2));
          console.log('------------------------------------');

          botMessagePayload = {
            text: visPackage.summary,
            ...executionResult,
            visPackage,
            verifier_output: verificationResult,
            executedSql: finalSql,
          };
        }
      }
    } else if (tool === TOOLS.RESULT_INTERPRETER) {
      const interpretation = await resultInterpreter.interpretResult(prompt, conversationHistory, lastResult);
      botMessagePayload = { text: interpretation };
    } else {
      // Defaults to general_conversation
      const conversationalResponse = await generalConversation.handleConversation(prompt, conversationHistory);
      botMessagePayload = { text: conversationalResponse };
    }

    // 3. SAVE BOT'S RESPONSE & SEND
    const finalBotMessage = { sender: 'bot', ...botMessagePayload };
    await conversationService.addMessageToConversation(conversationId, finalBotMessage);
    await auditService.logEvent({
      action: AUDIT_ACTIONS.ADD_MESSAGE,
      userId,
      conversationId,
      details: { sender: 'bot', text: finalBotMessage.text },
    });

    res.json({ conversationId, ...finalBotMessage });
  } catch (error) {
    console.error('--- INTERNAL SERVER ERROR ---', error);
    res.status(500).json({
      text: 'An unexpected error occurred.',
      error: error.message,
      isError: true,
    });
  }
};

module.exports = {
  getHealthCheck,
  testAI,
  getSchema,
  generateSQL,
  handleAgentChat,
};
