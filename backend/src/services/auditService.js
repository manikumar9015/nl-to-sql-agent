const { getMongoDb } = require('./dbPoolManager');

// Define a constant for our collection name to avoid typos
const AUDIT_COLLECTION = 'audit_logs';

/**
 * Creates a structured log entry in the audit trail.
 * @param {object} logData - The data to log.
 * @param {string} logData.action - A clear name for the event (e.g., 'ROUTE_REQUEST', 'EXECUTE_SQL').
 * @param {string} [logData.userId] - The ID of the user performing the action (we'll use a placeholder).
 * @param {string} [logData.conversationId] - The ID of the conversation.
 * @param {object} logData.details - A flexible object containing context-specific details.
 */
async function logEvent(logData) {
  try {
    const db = getMongoDb();
    const collection = db.collection(AUDIT_COLLECTION);

    const entry = {
      timestamp: new Date(),
      userId: 'user_placeholder', // Hardcoded for now, would come from JWT in a real app
      conversationId: 'convo_placeholder', // Hardcoded for now
      ...logData,
    };

    await collection.insertOne(entry);
    console.log(`[AUDIT] Logged event: ${logData.action}`);
  } catch (error) {
    console.error('--- AUDIT LOGGING FAILED ---', error);
    // In a production system, you'd have a fallback or alert here.
  }
}

module.exports = {
  logEvent,
};