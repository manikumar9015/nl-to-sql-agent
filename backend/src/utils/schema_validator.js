/**
 * Schema Validator
 * Validates schema structure before database creation
 */

const AppError = require('./AppError');

// PostgreSQL reserved words (subset of most common ones)
const RESERVED_WORDS = new Set([
  'select', 'from', 'where', 'insert', 'update', 'delete', 'create', 'drop',
  'alter', 'table', 'index', 'view', 'user', 'group', 'order', 'by', 'limit',
  'offset', 'join', 'inner', 'outer', 'left', 'right', 'on', 'and', 'or', 'not',
  'null', 'true', 'false', 'default', 'primary', 'foreign', 'key', 'unique',
  'constraint', 'references', 'cascade', 'check', 'as', 'distinct', 'case',
  'when', 'then', 'else', 'end', 'exists', 'in', 'like', 'between', 'is'
]);

// Valid PostgreSQL data types (common ones)
const VALID_DATA_TYPES = new Set([
  'SERIAL', 'BIGSERIAL', 'SMALLSERIAL',
  'INTEGER', 'INT', 'BIGINT', 'SMALLINT',
  'DECIMAL', 'NUMERIC', 'REAL', 'DOUBLE PRECISION',
  'MONEY',
  'CHAR', 'VARCHAR', 'TEXT',
  'BYTEA',
  'TIMESTAMP', 'TIMESTAMP WITH TIME ZONE', 'TIMESTAMP WITHOUT TIME ZONE',
  'DATE', 'TIME', 'TIME WITH TIME ZONE', 'TIME WITHOUT TIME ZONE',
  'INTERVAL',
  'BOOLEAN', 'BOOL',
  'POINT', 'LINE', 'LSEG', 'BOX', 'PATH', 'POLYGON', 'CIRCLE',
  'INET', 'CIDR', 'MACADDR',
  'UUID',
  'JSON', 'JSONB',
  'ARRAY'
]);

/**
 * Validate complete schema
 * @param {Object} schema - Schema to validate
 * @throws {AppError} If validation fails
 */
function validateSchema(schema) {
  if (!schema || typeof schema !== 'object') {
    throw new AppError('Schema must be an object', 400);
  }
  
  if (!schema.tables || !Array.isArray(schema.tables)) {
    throw new AppError('Schema must contain a tables array', 400);
  }
  
  if (schema.tables.length === 0) {
    throw new AppError('Schema must contain at least one table', 400);
  }
  
  // Validate each table
  const tableNames = new Set();
  schema.tables.forEach((table, index) => {
    validateTable(table, index);
    
    // Check for duplicate table names
    if (tableNames.has(table.name.toLowerCase())) {
      throw new AppError(`Duplicate table name: ${table.name}`, 400);
    }
    tableNames.add(table.name.toLowerCase());
  });
  
  // Validate foreign key references
  validateForeignKeyReferences(schema);
  
  // Check for circular dependencies
  detectCircularDependencies(schema);
  
  return true;
}

/**
 * Validate single table
 * @param {Object} table - Table definition
 * @param {number} index - Table index for error messages
 * @throws {AppError} If validation fails
 */
function validateTable(table, index) {
  if (!table.name || typeof table.name !== 'string') {
    throw new AppError(`Table at index ${index} must have a name`, 400);
  }
  
  validateIdentifier(table.name, 'Table name');
  
  if (!table.columns || !Array.isArray(table.columns)) {
    throw new AppError(`Table "${table.name}" must have a columns array`, 400);
  }
  
  if (table.columns.length === 0) {
    throw new AppError(`Table "${table.name}" must have at least one column`, 400);
  }
  
  // Validate columns
  const columnNames = new Set();
  table.columns.forEach((column, colIndex) => {
    validateColumn(column, table.name, colIndex);
    
    // Check for duplicate column names
    if (columnNames.has(column.name.toLowerCase())) {
      throw new AppError(`Duplicate column name in table "${table.name}": ${column.name}`, 400);
    }
    columnNames.add(column.name.toLowerCase());
  });
}

/**
 * Validate single column
 * @param {Object} column - Column definition
 * @param {string} tableName - Parent table name
 * @param {number} index - Column index for error messages
 * @throws {AppError} If validation fails
 */
function validateColumn(column, tableName, index) {
  if (!column.name || typeof column.name !== 'string') {
    throw new AppError(`Column at index ${index} in table "${tableName}" must have a name`, 400);
  }
  
  validateIdentifier(column.name, `Column name in table "${tableName}"`);
  
  if (!column.type || typeof column.type !== 'string') {
    throw new AppError(`Column "${column.name}" in table "${tableName}" must have a type`, 400);
  }
  
  validateDataType(column.type, column.name, tableName);
  
  // Validate foreign key if present
  if (column.foreignKey) {
    validateForeignKey(column.foreignKey, column.name, tableName);
  }
}

/**
 * Validate PostgreSQL identifier (table/column name)
 * @param {string} identifier - Identifier to validate
 * @param {string} context - Context for error message
 * @throws {AppError} If invalid
 */
function validateIdentifier(identifier, context) {
  // Check length
  if (identifier.length > 63) {
    throw new AppError(`${context} "${identifier}" exceeds maximum length of 63 characters`, 400);
  }
  
  // Check for valid characters (letters, digits, underscores)
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
    throw new AppError(
      `${context} "${identifier}" contains invalid characters. Must start with letter or underscore, followed by letters, digits, or underscores.`,
      400
    );
  }
  
  // Warn about reserved words (don't throw, just warn - quotes will handle it)
  if (RESERVED_WORDS.has(identifier.toLowerCase())) {
    console.warn(`Warning: ${context} "${identifier}" is a PostgreSQL reserved word. It will be quoted.`);
  }
}

/**
 * Validate data type
 * @param {string} dataType - Data type to validate
 * @param {string} columnName - Column name for error message
 * @param {string} tableName - Table name for error message
 * @throws {AppError} If invalid
 */
function validateDataType(dataType, columnName, tableName) {
  // Extract base type (e.g., VARCHAR from VARCHAR(255))
  const baseType = dataType.match(/^[A-Z\s]+/i)?.[0]?.trim().toUpperCase();
  
  if (!baseType) {
    throw new AppError(
      `Invalid data type "${dataType}" for column "${columnName}" in table "${tableName}"`,
      400
    );
  }
  
  // Check if it's a valid type or starts with a valid type (for parameterized types)
  const isValid = VALID_DATA_TYPES.has(baseType) || 
                  Array.from(VALID_DATA_TYPES).some(validType => 
                    dataType.toUpperCase().startsWith(validType)
                  );
  
  if (!isValid) {
    throw new AppError(
      `Unsupported data type "${dataType}" for column "${columnName}" in table "${tableName}"`,
      400
    );
  }
}

/**
 * Validate foreign key definition
 * @param {Object} fk - Foreign key definition
 * @param {string} columnName - Column name
 * @param {string} tableName - Table name
 * @throws {AppError} If invalid
 */
function validateForeignKey(fk, columnName, tableName) {
  if (!fk.table || typeof fk.table !== 'string') {
    throw new AppError(
      `Foreign key on column "${columnName}" in table "${tableName}" must specify a table`,
      400
    );
  }
  
  if (!fk.column || typeof fk.column !== 'string') {
    throw new AppError(
      `Foreign key on column "${columnName}" in table "${tableName}" must specify a column`,
      400
    );
  }
  
  if (fk.onDelete) {
    const validActions = ['CASCADE', 'SET NULL', 'SET DEFAULT', 'RESTRICT', 'NO ACTION'];
    if (!validActions.includes(fk.onDelete.toUpperCase())) {
      throw new AppError(
        `Invalid onDelete action "${fk.onDelete}" for foreign key on column "${columnName}"`,
        400
      );
    }
  }
}

/**
 * Validate that all foreign key references point to existing tables
 * @param {Object} schema - Complete schema
 * @throws {AppError} If references are invalid
 */
function validateForeignKeyReferences(schema) {
  const tableNames = new Set(schema.tables.map(t => t.name.toLowerCase()));
  
  schema.tables.forEach(table => {
    table.columns.forEach(column => {
      if (column.foreignKey) {
        const refTable = column.foreignKey.table.toLowerCase();
        if (!tableNames.has(refTable)) {
          throw new AppError(
            `Foreign key on column "${column.name}" in table "${table.name}" references non-existent table "${column.foreignKey.table}"`,
            400
          );
        }
      }
    });
  });
}

/**
 * Detect circular foreign key dependencies
 * @param {Object} schema - Complete schema
 * @throws {AppError} If circular dependency detected
 */
function detectCircularDependencies(schema) {
  // Build dependency graph
  const graph = new Map();
  schema.tables.forEach(table => {
    graph.set(table.name.toLowerCase(), new Set());
  });
  
  schema.tables.forEach(table => {
    table.columns.forEach(column => {
      if (column.foreignKey) {
        const refTable = column.foreignKey.table.toLowerCase();
        // Ignore self-references (e.g., parent_id pointing to same table)
        // These are valid and don't cause creation order issues if handled correctly
        if (refTable !== table.name.toLowerCase()) {
          graph.get(table.name.toLowerCase()).add(refTable);
        }
      }
    });
  });
  
  // DFS to detect cycles
  const visited = new Set();
  const recStack = new Set();
  
  function hasCycle(node, path = []) {
    visited.add(node);
    recStack.add(node);
    path.push(node);
    
    const neighbors = graph.get(node);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor, [...path])) {
          return true;
        }
      } else if (recStack.has(neighbor)) {
        throw new AppError(
          `Circular foreign key dependency detected: ${[...path, neighbor].join(' -> ')}`,
          400
        );
      }
    }
    
    recStack.delete(node);
    return false;
  }
  
  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      hasCycle(node);
    }
  }
}

/**
 * Validate database name
 * @param {string} dbName - Database name to validate
 * @throws {AppError} If invalid
 */
function validateDatabaseName(dbName) {
  if (!dbName || typeof dbName !== 'string') {
    throw new AppError('Database name is required', 400);
  }
  
  validateIdentifier(dbName, 'Database name');
  
  // Additional database-specific checks
  if (dbName.toLowerCase() === 'postgres' || dbName.toLowerCase() === 'template0' || dbName.toLowerCase() === 'template1') {
    throw new AppError(`Cannot use reserved database name: ${dbName}`, 400);
  }
}

module.exports = {
  validateSchema,
  validateDatabaseName,
  validateIdentifier,
  validateDataType,
};
