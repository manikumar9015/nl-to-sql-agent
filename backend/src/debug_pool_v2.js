
try {
  require('dotenv').config();
  console.log('Environment loaded.');
  console.log('Attempting to import dbPoolManager...');
  const { getDbPool } = require('./services/dbPoolManager');
  console.log('dbPoolManager imported.');

  async function testConnection() {
    console.log('Testing connection to blogpage_db...');
    try {
      const pool = getDbPool('blogpage_db');
      console.log('Pool obtained for blogpage_db');
      const res = await pool.query('SELECT 1 as val');
      console.log('✅ Connection successful! Result:', res.rows[0]);
      process.exit(0);
    } catch (err) {
      console.error('❌ Connection failed:', err);
      process.exit(1);
    }
  }

  testConnection();
} catch (e) {
  console.error('CRITICAL ERROR:', e);
}
