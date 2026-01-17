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

const pgPool = new Pool(postgresConfig);

pgPool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL:', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL successfully at:', res.rows[0].now);
  }
});


// --- MongoDB Client ---

const mongoUri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/?authSource=admin`;
const mongoClient = new MongoClient(mongoUri);

let mongoDbInstance;

async function connectToMongo() {
  try {
    await mongoClient.connect();
    console.log('✅ Connected to MongoDB successfully.');
    mongoDbInstance = mongoClient.db(process.env.MONGO_DB_NAME);
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err);
    process.exit(1);
  }
}

function getMongoDb() {
  if (!mongoDbInstance) {
    console.error('MongoDB not connected. Call connectToMongo() first.');
    process.exit(1);
  }
  return mongoDbInstance;
}

/**
 * The source of truth for all configured SQL database connections.
 */
const salesDbConfig = { ...postgresConfig, database: 'sales_db' };
const studentDbConfig = { ...postgresConfig, database: 'student_db' };

const databasePools = {
  'sales_db': new Pool(salesDbConfig),
  'student_db' : new Pool(studentDbConfig)
  // 'marketing_db': new Pool(...) // This is where you would add more databases
};

function getDbPool(dbName = 'sales_db') {
  if (!databasePools[dbName]) {
    console.log(`Creating new connection pool for database: ${dbName}`);
    const newDbConfig = { ...postgresConfig, database: dbName };
    databasePools[dbName] = new Pool(newDbConfig);
  }
  return databasePools[dbName];
}


// --- ADD THIS NEW FUNCTION ---
/**
 * Returns a list of names of all configured databases.
 * @returns {Array<string>} An array of database names.
 */
function getAvailableDatabases() {
  return Object.keys(databasePools);
}
// ----------------------------


module.exports = {
  getDbPool,
  connectToMongo,
  getMongoDb,
  getAvailableDatabases, // <-- Add the new function to the exports
};