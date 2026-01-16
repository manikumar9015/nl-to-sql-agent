/**
 * SSE-enabled Agent Chat Handler
 * Streams thinking steps in real-time to the frontend
 */

const router = require('../agent/router');
const aiClient = require('../services/aiClient');
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
const logger = require('../utils/logger');
const sseHelper = require('../utils/sseHelper');

/**
 * Handle agent chat with SSE streaming
 */
const handleAgentChatStream = async (req, res) => {
  let {
    conversationId,
    prompt,
    dbName,
    conversationHistory = [],
    lastResult = null,
  } = req.query; // GET params for SSE

  const userId = req.user.userId;

  if (!prompt || !dbName) {
    return res.status(400).json({ error: 'Prompt and dbName are required.' });
  }

  try {
    // Setup SSE
    sseHelper.setupSSE(res);
    
    sseHelper.sendThinkingStep(res, 'Analyzing your question...');

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
    sseHelper.sendThinkingStep(res, 'Determining request type...');
    const tool = await router.route(prompt, conversationHistory ?JSON.parse(conversationHistory) : []);
    
    await auditService.logEvent({
      action: AUDIT_ACTIONS.ROUTE_REQUEST,
      userId,
      conversationId,
      details: { prompt, tool },
    });

    // Send routing result
    const toolNames = {
      [TOOLS.DATABASE_QUERY]: 'Database query detected',
      [TOOLS.QUERY_REFINEMENT]: 'Query refinement detected',
      [TOOLS.RESULT_INTERPRETER]: 'Result interpretation detected',
      [TOOLS.GENERAL_CONVERSATION]: 'General conversation detected',
    };
    sseHelper.sendThinkingStep(res, toolNames[tool] || 'Processing request');

    // 2. EXECUTE THE SELECTED TOOL
    let botMessagePayload = {};

    // QUERY REFINEMENT HANDLER
    if (tool === TOOLS.QUERY_REFINEMENT) {
      const lastSqlData = await conversationService.getLastExecutedSql(conversationId);
      
      if (!lastSqlData || !lastSqlData.sql) {
        botMessagePayload = { text: "I don't have a previous query to refine. Please run a query first." };
      } else {
        sseHelper.sendThinkingStep(res, 'Refining previous query...');
        const refinementResult = await queryRefiner.refineSql(
          prompt,
          lastSqlData.sql,
          dbName,
          conversationHistory ? JSON.parse(conversationHistory) : []
        );

        if (!refinementResult.wasModified) {
          sseHelper.sendThinkingStep(res, 'Refinement not possible, generating new query...');
          const generatedSql = await sqlGenerator.generateSql(prompt, dbName, conversationHistory ? JSON.parse(conversationHistory) : []);
          
          sseHelper.sendThinkingStep(res, 'Verifying SQL safety...');
          const verificationResult = await sqlVerifier.verifySql(prompt, generatedSql, dbName, conversationHistory ? JSON.parse(conversationHistory) : []);
          
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
            
            sseHelper.sendThinkingStep(res, 'Executing query...');
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
              sseHelper.sendThinkingStep(res, 'Creating visualization...');
              const visPackage = await visualizationAgent.createVisualization(
                prompt,
                finalSql,
                executionResult.executionMetadata,
                executionResult.maskedSample,
                conversationHistory ? JSON.parse(conversationHistory) : []
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
          sseHelper.sendThinkingStep(res, 'Verifying refined query...');
          const refinedSql = refinementResult.sql;
          const verificationResult = await sqlVerifier.verifySql(prompt, refinedSql, dbName, conversationHistory ? JSON.parse(conversationHistory) : []);

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
            
            sseHelper.sendThinkingStep(res, 'Executing refined query...');
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
              sseHelper.sendThinkingStep(res, 'Creating visualization...');
              const visPackage = await visualizationAgent.createVisualization(
                prompt,
                finalSql,
                executionResult.executionMetadata,
                executionResult.maskedSample,
                conversationHistory ? JSON.parse(conversationHistory) : []
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
      sseHelper.sendThinkingStep(res, 'Generating SQL query...');
      const generatedSql = await sqlGenerator.generateSql(prompt, dbName, conversationHistory ? JSON.parse(conversationHistory) : []);
      
      sseHelper.sendThinkingStep(res, 'Verifying SQL safety...');
      const verificationResult = await sqlVerifier.verifySql(prompt, generatedSql, dbName, conversationHistory ? JSON.parse(conversationHistory) : []);
      
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
        
        sseHelper.sendThinkingStep(res, 'Executing query...');
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
          sseHelper.sendThinkingStep(res, 'Creating visualization...');
          const visPackage = await visualizationAgent.createVisualization(
            prompt,
            finalSql,
            executionResult.executionMetadata,
            executionResult.maskedSample,
            conversationHistory ? JSON.parse(conversationHistory) : []
          );

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
      sseHelper.sendThinkingStep(res, 'Interpreting previous results...');
      const interpretation = await resultInterpreter.interpretResult(prompt, conversationHistory ? JSON.parse(conversationHistory) : [], lastResult ? JSON.parse(lastResult) : null);
      botMessagePayload = { text: interpretation };
    } else {
      sseHelper.sendThinkingStep(res, 'Generating response...');
      const conversationalResponse = await generalConversation.handleConversation(prompt, conversationHistory ? JSON.parse(conversationHistory) : []);
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

    // Send complete message
    sseHelper.sendComplete(res, { conversationId, ...finalBotMessage });
  } catch (error) {
    logger.error('SSE Error in agent chat', { error: error.message, stack: error.stack });
    sseHelper.sendError(res, error);
  }
};

module.exports = {
  handleAgentChatStream,
};
