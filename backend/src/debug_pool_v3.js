
const fs = require('fs');

function log(msg) {
  fs.appendFileSync('verification_result.txt', msg + '\n');
}

try {
  log('Starting verification script...');
  require('dotenv').config();
  log('Environment loaded.');
  
  const { getDbPool } = require('./services/dbPoolManager');
  log('dbPoolManager imported.');

  async function testConnection() {
    log('Testing connection to blogpage_db...');
    try {
      const pool = getDbPool('blogpage_db');
      log('Pool obtained for blogpage_db');
      const res = await pool.query('SELECT 1 as val');
      log(`✅ Connection successful! Result: ${JSON.stringify(res.rows[0])}`);
      process.exit(0);
    } catch (err) {
      log(`❌ Connection failed: ${err.message}`);
      process.exit(1);
    }
  }

  testConnection();
} catch (e) {
  log(`CRITICAL ERROR: ${e.message}`);
}
