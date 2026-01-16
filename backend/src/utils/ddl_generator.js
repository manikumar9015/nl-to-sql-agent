/**
 * DDL Generator
 * Converts JSON schema to PostgreSQL DDL statements
 */

/**
 * Generate CREATE DATABASE statement
 * @param {string} dbName - Database name
 * @returns {string} DDL statement
 */
function generateCreateDatabase(dbName) {
  return `CREATE DATABASE ${sanitizeIdentifier(dbName)};`;
}

/**
 * Generate CREATE TABLE statement for a single table
 * @param {Object} table - Table definition
 * @returns {string} CREATE TABLE DDL
 */
function generateCreateTable(table) {
  const tableName = sanitizeIdentifier(table.name);
  const columnDefs = table.columns.map(col => generateColumnDefinition(col)).join(',\n  ');
  
  let ddl = `CREATE TABLE ${tableName} (\n  ${columnDefs}`;
  
  // Add primary key constraint if specified
  const pkColumns = table.columns.filter(col => col.primaryKey).map(col => sanitizeIdentifier(col.name));
  if (pkColumns.length > 0) {
    ddl += `,\n  PRIMARY KEY (${pkColumns.join(', ')})`;
  }
  
  // Add unique constraints
  const uniqueColumns = table.columns.filter(col => col.unique && !col.primaryKey);
  uniqueColumns.forEach(col => {
    ddl += `,\n  UNIQUE (${sanitizeIdentifier(col.name)})`;
  });
  
  ddl += '\n);';
  
  return ddl;
}

/**
 * Generate column definition
 * @param {Object} column - Column definition
 * @returns {string} Column DDL
 */
function generateColumnDefinition(column) {
  let def = sanitizeIdentifier(column.name) + ' ' + column.type;
  
  if (column.nullable === false) {
    def += ' NOT NULL';
  }
  
  if (column.default !== undefined) {
    def += ` DEFAULT ${column.default}`;
  }
  
  return def;
}

/**
 * Generate ALTER TABLE statements for foreign keys
 * @param {Object} schema - Complete schema
 * @returns {string[]} Array of ALTER TABLE statements
 */
function generateForeignKeyConstraints(schema) {
  const constraints = [];
  
  schema.tables.forEach(table => {
    table.columns.forEach(column => {
      if (column.foreignKey) {
        const tableName = sanitizeIdentifier(table.name);
        const columnName = sanitizeIdentifier(column.name);
        const refTable = sanitizeIdentifier(column.foreignKey.table);
        const refColumn = sanitizeIdentifier(column.foreignKey.column);
        const onDelete = column.foreignKey.onDelete || 'NO ACTION';
        const constraintName = `fk_${table.name}_${column.name}`;
        
        constraints.push(
          `ALTER TABLE ${tableName}\n` +
          `  ADD CONSTRAINT ${constraintName}\n` +
          `  FOREIGN KEY (${columnName})\n` +
          `  REFERENCES ${refTable}(${refColumn})\n` +
          `  ON DELETE ${onDelete};`
        );
      }
    });
  });
  
  return constraints;
}

/**
 * Generate complete DDL script
 * @param {string} dbName - Database name
 * @param {Object} schema - Complete schema
 * @returns {string} Full DDL script
 */
function generateFullDDL(dbName, schema) {
  const lines = [];
  
  lines.push('-- Database Creation');
  lines.push(generateCreateDatabase(dbName));
  lines.push('');
  lines.push(`-- Connect to the database`);
  lines.push(`\\c ${sanitizeIdentifier(dbName)}`);
  lines.push('');
  
  // Create tables
  lines.push('-- Table Creation');
  schema.tables.forEach(table => {
    lines.push(generateCreateTable(table));
    lines.push('');
  });
  
  // Add foreign keys
  const foreignKeys = generateForeignKeyConstraints(schema);
  if (foreignKeys.length > 0) {
    lines.push('-- Foreign Key Constraints');
    foreignKeys.forEach(fk => {
      lines.push(fk);
      lines.push('');
    });
  }
  
  return lines.join('\n');
}

/**
 * Sanitize PostgreSQL identifier (table/column names)
 * @param {string} identifier - Raw identifier
 * @returns {string} Sanitized identifier
 */
function sanitizeIdentifier(identifier) {
  // Use double quotes for identifiers to preserve case and allow reserved words
  // Remove any existing quotes and re-quote
  return `"${identifier.replace(/"/g, '""')}"`;
}

/**
 * Generate only table creation statements (no database creation)
 * Used when creating tables in an existing database
 * @param {Object} schema - Complete schema
 * @returns {string} Table DDL
 */
function generateTablesOnly(schema) {
  const lines = [];
  
  // Create tables
  schema.tables.forEach(table => {
    lines.push(generateCreateTable(table));
    lines.push('');
  });
  
  // Add foreign keys
  const foreignKeys = generateForeignKeyConstraints(schema);
  if (foreignKeys.length > 0) {
    lines.push('-- Foreign Key Constraints');
    foreignKeys.forEach(fk => {
      lines.push(fk);
      lines.push('');
    });
  }
  
  return lines.join('\n');
}

module.exports = {
  generateCreateDatabase,
  generateCreateTable,
  generateForeignKeyConstraints,
  generateFullDDL,
  generateTablesOnly,
  sanitizeIdentifier,
};
