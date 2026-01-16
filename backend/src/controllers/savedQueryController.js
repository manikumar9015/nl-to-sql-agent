/**
 * Saved Query Controller
 * Handles all saved query operations
 */

const savedQueryService = require('../services/savedQueryService');

/**
 * Get all saved queries for logged-in user
 */
const getSavedQueries = async (req, res) => {
  try {
    const queries = await savedQueryService.getSavedQueries(req.user.userId);
    res.json(queries);
  } catch (error) {
    console.error('[SAVED QUERIES ERROR]:', error);
    res.status(500).json({ error: 'Failed to fetch saved queries' });
  }
};

/**
 * Save a new query
 */
const saveQuery = async (req, res) => {
  try {
    const { name, sql, dbName, visualizationType } = req.body;
    
    if (!name || !sql || !dbName || !visualizationType) {
      return res.status(400).json({ 
        error: 'name, sql, dbName, and visualizationType are required' 
      });
    }

    const savedQuery = await savedQueryService.saveQuery(
      req.user.userId,
      name,
      sql,
      dbName,
      visualizationType
    );
    
    res.status(201).json(savedQuery);
  } catch (error) {
    console.error('[SAVE QUERY ERROR]:', error);
    res.status(500).json({ error: 'Failed to save query' });
  }
};

/**
 * Execute saved query and get fresh data
 */
const executeQuery = async (req, res) => {
  try {
    const result = await savedQueryService.executeQuery(req.params.id, req.user.userId);
    res.json(result);
  } catch (error) {
    console.error('[EXECUTE QUERY ERROR]:', error);
    res.status(500).json({ error: error.message || 'Failed to execute query' });
  }
};

/**
 * Delete saved query
 */
const deleteSavedQuery = async (req, res) => {
  try {
    const result = await savedQueryService.deleteSavedQuery(req.params.id, req.user.userId);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Saved query not found' });
    }

    res.json({ success: true, message: 'Query deleted' });
  } catch (error) {
    console.error('[DELETE QUERY ERROR]:', error);
    res.status(500).json({ error: 'Failed to delete query' });
  }
};

module.exports = {
  getSavedQueries,
  saveQuery,
  executeQuery,
  deleteSavedQuery,
};
