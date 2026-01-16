/**
 * Admin Controller
 * Handles admin-related endpoints
 */

const dbManager = require('../services/dbPoolManager');

/**
 * View audit logs
 */
const getAuditLogs = async (req, res) => {
  try {
    const db = dbManager.getMongoDb();
    const logs = await db
      .collection('audit_logs')
      .find()
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray();
    res.json(logs);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve audit logs.',
      details: error.message,
    });
  }
};

module.exports = {
  getAuditLogs,
};
