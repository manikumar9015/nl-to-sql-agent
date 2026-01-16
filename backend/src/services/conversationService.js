const { getMongoDb } = require('./dbPoolManager');
const { ObjectId } = require('mongodb'); // Needed to query by MongoDB's unique _id

const CONVERSATIONS_COLLECTION = 'conversations';

// Get all conversations (metadata only) for a user
async function getConversationsForUser(userId) {
  const db = getMongoDb();
  // We project to exclude the large 'messages' array for this list view
  const conversations = await db.collection(CONVERSATIONS_COLLECTION)
    .find({ userId: new ObjectId(userId) })
    .project({ title: 1, createdAt: 1, selectedDatabase: 1 })
    .sort({ createdAt: -1 })
    .toArray();
  return conversations;
}

// Get a single, full conversation by its ID
async function getConversationById(conversationId, userId) {
  const db = getMongoDb();
  const conversation = await db.collection(CONVERSATIONS_COLLECTION)
    .findOne({
      _id: new ObjectId(conversationId),
      userId: new ObjectId(userId), // Ensure the user owns this conversation
    });
  return conversation;
}

// Create a new conversation
async function createConversation(userId, selectedDatabase, messages = []) {
  const db = getMongoDb();
  const newConversation = {
    userId: new ObjectId(userId),
    title: 'New Chat',
    selectedDatabase,
    messages, // Accept initial messages
    createdAt: new Date(),
  };
  const result = await db.collection(CONVERSATIONS_COLLECTION).insertOne(newConversation);
  return { ...newConversation, _id: result.insertedId };
}

// Add a message to an existing conversation
async function addMessageToConversation(conversationId, message) {
  const db = getMongoDb();
  const result = await db.collection(CONVERSATIONS_COLLECTION)
    .updateOne(
      { _id: new ObjectId(conversationId) },
      { $push: { messages: message } }
    );
  return result;
}

// Update conversation messages (replace all messages)
async function updateConversationMessages(conversationId, userId, messages) {
  const db = getMongoDb();
  const result = await db.collection(CONVERSATIONS_COLLECTION)
    .updateOne(
      { _id: new ObjectId(conversationId), userId: new ObjectId(userId) },
      { $set: { messages, updatedAt: new Date() } }
    );
  return result;
}

// Update the title of a conversation
async function updateConversationTitle(conversationId, userId, newTitle) {
  const db = getMongoDb();
  const result = await db.collection(CONVERSATIONS_COLLECTION)
    .updateOne(
      { _id: new ObjectId(conversationId), userId: new ObjectId(userId) },
      { $set: { title: newTitle } }
    );
  return result;
}

/**
 * Gets the last executed SQL query from a conversation.
 * Used for query refinement feature.
 * @param {string} conversationId The conversation ID
 * @returns {Promise<Object|null>} Object with sql and timestamp, or null if not found
 */
async function getLastExecutedSql(conversationId) {
  const db = getMongoDb();
  const conversation = await db.collection(CONVERSATIONS_COLLECTION)
    .findOne({ _id: new ObjectId(conversationId) });

  if (!conversation || !conversation.messages) {
    return null;
  }

  // Find the most recent bot message with executed SQL
  const messagesWithSql = conversation.messages
    .filter(msg => msg.sender === 'bot' && msg.executedSql)
    .reverse(); // Most recent first

  if (messagesWithSql.length === 0) {
    return null;
  }

  const lastMessage = messagesWithSql[0];
  return {
    sql: lastMessage.executedSql,
    timestamp: lastMessage.timestamp,
    sqlVersions: lastMessage.sqlVersions || [],
  };
}

/**
 * Adds SQL version history to a bot message.
 * Tracks modifications to SQL queries over time.
 * @param {string} conversationId The conversation ID
 * @param {string} sql The SQL query
 * @param {string} reason The modification reason
 */
async function addSqlVersion(conversationId, sql, reason = 'initial') {
  const db = getMongoDb();
  const conversation = await db.collection(CONVERSATIONS_COLLECTION)
    .findOne({ _id: new ObjectId(conversationId) });

  if (!conversation || !conversation.messages || conversation.messages.length === 0) {
    return;
  }

  // Update the last bot message with SQL version
  const lastIndex = conversation.messages.length - 1;
  const lastMessage = conversation.messages[lastIndex];

  if (lastMessage.sender === 'bot' && lastMessage.executedSql) {
    const sqlVersions = lastMessage.sqlVersions || [];
    sqlVersions.push({
      sql,
      timestamp: new Date(),
      modificationReason: reason,
    });

    // Keep only last 10 versions to prevent document bloat
    const limitedVersions = sqlVersions.slice(-10);

    await db.collection(CONVERSATIONS_COLLECTION).updateOne(
      { _id: new ObjectId(conversationId) },
      { $set: { [`messages.${lastIndex}.sqlVersions`]: limitedVersions } }
    );
  }
}

// Delete a conversation
async function deleteConversation(conversationId, userId) {
  const db = getMongoDb();
  const result = await db.collection(CONVERSATIONS_COLLECTION)
    .deleteOne({
      _id: new ObjectId(conversationId),
      userId: new ObjectId(userId), // Ensure the user owns this conversation
    });
  return result;
}

module.exports = {
  getConversationsForUser,
  getConversationById,
  createConversation,
  addMessageToConversation,
  updateConversationMessages,
  updateConversationTitle,
  getLastExecutedSql,
  addSqlVersion,
  deleteConversation,
};
