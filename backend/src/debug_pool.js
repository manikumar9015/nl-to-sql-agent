
require('dotenv').config();
const { getDbPool } = require('./services/dbPoolManager');

async function testConnection() {
  console.log('Testing connection to blogpage_db...');
  try {
    const pool = getDbPool('blogpage_db');
    const res = await pool.query('SELECT 1 as val');
    console.log('✅ Connection successful! Result:', res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err);
    process.exit(1);
  }
}

testConnection();
