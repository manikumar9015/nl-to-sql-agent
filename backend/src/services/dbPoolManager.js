const { Pool } = require('pg');
const { MongoClient } = require('mongodb');

// --- PostgreSQL Connection Pool ---

const postgresConfig = {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT, 10),
};

// A pool is better than a single client for handling multiple concurrent requests.
const pgPool = new Pool(postgresConfig);

// Test the PostgreSQL connection
pgPool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL:', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL successfully at:', res.rows[0].now);
  }
});


// --- MongoDB Client ---

// Connection URI for MongoDB
const mongoUri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/?authSource=admin`;
const mongoClient = new MongoClient(mongoUri);

let mongoDbInstance;

// Asynchronous function to connect to MongoDB
async function connectToMongo() {
  try {
    await mongoClient.connect();
    console.log('✅ Connected to MongoDB successfully.');
    mongoDbInstance = mongoClient.db(process.env.MONGO_DB_NAME);
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err);
    // Exit the process if we can't connect to a critical service
    process.exit(1);
  }
}

// Function to get the MongoDB database instance
function getMongoDb() {
  if (!mongoDbInstance) {
    console.error('MongoDB not connected. Call connectToMongo() first.');
    process.exit(1);
  }
  return mongoDbInstance;
}

/**
 * In a multi-database setup as per the plan, this is where you'd have a map of pools.
 * For now, we'll just export the single pool.
 * The key 'default' represents our primary sales_db.
 */
const databasePools = {
  'sales_db': pgPool,
  // 'marketing_db': new Pool(...) // This is how you would add more
};

function getDbPool(dbName = 'sales_db') {
  const pool = databasePools[dbName];
  if (!pool) {
    throw new Error(`Database pool for '${dbName}' not found.`);
  }
  return pool;
}

module.exports = {
  getDbPool,
  connectToMongo,
  getMongoDb,
};