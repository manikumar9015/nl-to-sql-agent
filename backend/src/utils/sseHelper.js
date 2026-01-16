/**
 * Server-Sent Events (SSE) Helper Utilities
 * Functions to help stream thinking steps from backend to frontend
 */

const logger = require('./logger');

/**
 * Setup SSE connection headers
 */
const setupSSE = (res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
  });
  
  // Send initial comment to establish connection
  res.write(': connected\n\n');
};

/**
 * Send a thinking step to the client
 */
const sendThinkingStep = (res, step) => {
  const data = JSON.stringify({ type: 'thinking', step });
  res.write(`data: ${data}\n\n`);
  logger.debug('SSE: Sent thinking step', { step });
};

/**
 * Send progress update
 */
const sendProgress = (res, current, total) => {
  const data = JSON.stringify({ type: 'progress', current, total });
  res.write(`data: ${data}\n\n`);
};

/**
 * Send the final complete message and close connection
 */
const sendComplete = (res, responseData) => {
  const data = JSON.stringify({ type: 'complete', data: responseData });
  res.write(`data: ${data}\n\n`);
  res.end();
  logger.debug('SSE: Connection closed with complete message');
};

/**
 * Send error and close connection
 */
const sendError = (res, error) => {
  const data = JSON.stringify({ 
    type: 'error', 
    error: error.message || 'An error occurred',
    isError: true,
  });
  res.write(`data: ${data}\n\n`);
  res.end();
  logger.error('SSE: Connection closed with error', { error: error.message });
};

/**
 * Safe write wrapper that checks if connection is still open
 */
const safeWrite = (res, data) => {
  if (!res.writableEnded) {
    res.write(data);
    return true;
  }
  return false;
};

module.exports = {
  setupSSE,
  sendThinkingStep,
  sendProgress,
  sendComplete,
  sendError,
  safeWrite,
};
