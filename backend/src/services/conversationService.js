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
async function createConversation(userId, selectedDatabase) {
  const db = getMongoDb();
  const newConversation = {
    userId: new ObjectId(userId),
    title: 'New Chat',
    selectedDatabase,
    messages: [], // Starts with no messages
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

module.exports = {
  getConversationsForUser,
  getConversationById,
  createConversation,
  addMessageToConversation,
};