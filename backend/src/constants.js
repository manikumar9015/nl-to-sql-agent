/**
 * Application Constants
 * Centralized constants to replace magic strings throughout the application
 */

// Tool Names (used by router to determine which tool to execute)
const TOOLS = {
  DATABASE_QUERY: 'database_query',
  QUERY_REFINEMENT: 'query_refinement',
  RESULT_INTERPRETER: 'result_interpreter',
  GENERAL_CONVERSATION: 'general_conversation',
};

// Audit Log Action Types
const AUDIT_ACTIONS = {
  ADD_MESSAGE: 'ADD_MESSAGE',
  ROUTE_REQUEST: 'ROUTE_REQUEST',
  VERIFY_SQL: 'VERIFY_SQL',
  EXECUTE_SQL: 'EXECUTE_SQL',
  USER_LOGIN: 'USER_LOGIN',
  USER_REGISTER: 'USER_REGISTER',
};

// User Roles
const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  VIEWER: 'viewer',
};

// Default Values
const DEFAULTS = {
  CONVERSATION_TITLE: 'New Chat',
  USER_ROLE: 'user',
};

// Message Senders
const MESSAGE_SENDERS = {
  USER: 'user',
  BOT: 'bot',
};

// SQL Version Types
const SQL_VERSION_TYPES = {
  REGENERATED: 'regenerated',
  REFINED: 'refined',
  INITIAL: 'initial',
};

module.exports = {
  TOOLS,
  AUDIT_ACTIONS,
  USER_ROLES,
  DEFAULTS,
  MESSAGE_SENDERS,
  SQL_VERSION_TYPES,
};
