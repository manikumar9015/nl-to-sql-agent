import React from 'react';
import { Database, Key, Link } from 'lucide-react';

/**
 * Schema Visualizer Component
 * Displays database schema in a visual card-based format
 */
const SchemaDesigner = ({ schema }) => {
  if (!schema || !schema.tables || schema.tables.length === 0) {
    return (
      <div className="p-6 bg-zinc-50 dark:bg-[#1E1F20] rounded-lg border-2 border-dashed border-zinc-200 dark:border-[#28292A] text-center">
        <Database className="w-12 h-12 mx-auto mb-2 text-zinc-300 dark:text-[#C4C7C5]" />
        <p className="text-zinc-500 dark:text-[#C4C7C5]">No tables defined yet</p>
        <p className="text-sm text-zinc-400 dark:text-[#C4C7C5]/70 mt-1">
          Start describing your database requirements
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-zinc-700 dark:text-[#E3E3E3]" />
        <h3 className="font-semibold text-zinc-900 dark:text-[#E3E3E3]">
          Database Schema ({schema.tables.length} {schema.tables.length === 1 ? 'table' : 'tables'})
        </h3>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {schema.tables.map((table, idx) => (
          <TableCard key={idx} table={table} />
        ))}
      </div>
    </div>
  );
};

/**
 * Individual Table Card Component
 */
const TableCard = ({ table }) => {
  // Find foreign key relationships
  const foreignKeys = table.columns.filter(col => col.foreignKey);

  return (
    <div className="bg-white dark:bg-[#131314] border border-zinc-200 dark:border-[#28292A] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-zinc-800 to-black dark:from-[#1E1F20] dark:to-[#28292A] px-4 py-3 border-b border-transparent dark:border-[#28292A]">
        <h4 className="font-bold text-white dark:text-[#E3E3E3] flex items-center gap-2">
          <Database className="w-4 h-4 text-zinc-300 dark:text-[#C4C7C5]" />
          {table.name}
        </h4>
      </div>

      {/* Columns List */}
      <div className="p-4">
        <div className="space-y-2">
          {table.columns.map((column, idx) => (
            <ColumnRow key={idx} column={column} />
          ))}
        </div>

        {/* Foreign Key Relationships */}
        {foreignKeys.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-[#28292A]">
            <div className="text-xs font-semibold text-zinc-500 dark:text-[#C4C7C5] mb-2 flex items-center gap-1">
              <Link className="w-3 h-3" />
              Relationships
            </div>
            {foreignKeys.map((fk, idx) => (
              <div key={idx} className="text-xs text-zinc-600 dark:text-[#C4C7C5] flex items-center gap-1">
                <span className="font-mono bg-zinc-100 dark:bg-[#28292A] px-1 rounded border border-zinc-200 dark:border-[#3C4043]">{fk.name}</span>
                <span className="text-zinc-400 dark:text-[#C4C7C5]/50">→</span>
                <span className="font-mono bg-zinc-100 dark:bg-[#28292A] px-1 rounded border border-zinc-200 dark:border-[#3C4043]">
                  {fk.foreignKey.table}.{fk.foreignKey.column}
                </span>
                {fk.foreignKey.onDelete && (
                  <span className="text-xs text-zinc-400 dark:text-[#C4C7C5]/50">({fk.foreignKey.onDelete})</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Individual Column Row Component
 */
const ColumnRow = ({ column }) => {
  const badges = [];

  if (column.primaryKey) {
    badges.push(
      <span key="pk" className="text-xs px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50 rounded font-semibold flex items-center gap-0.5">
        <Key className="w-3 h-3" />
        PK
      </span>
    );
  }

  if (column.unique && !column.primaryKey) {
    badges.push(
      <span key="unique" className="text-xs px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-800/50 rounded">
        UNIQUE
      </span>
    );
  }

  if (column.nullable === false && !column.primaryKey) {
    badges.push(
      <span key="required" className="text-xs px-1.5 py-0.5 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-800/50 rounded">
        NOT NULL
      </span>
    );
  }

  if (column.foreignKey) {
    badges.push(
      <span key="fk" className="text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800/50 rounded flex items-center gap-0.5">
        <Link className="w-3 h-3" />
        FK
      </span>
    );
  }

  return (
    <div className="flex items-start justify-between gap-2 py-1.5 border-b border-zinc-50 dark:border-[#28292A] last:border-0">
      <div className="flex-1 min-w-0">
        <div className="font-mono text-sm font-medium text-zinc-700 dark:text-[#E3E3E3]">
          {column.name}
        </div>
        <div className="text-xs text-zinc-500 dark:text-[#C4C7C5] font-mono mt-0.5">
          {column.type}
        </div>
        {column.default && (
          <div className="text-xs text-zinc-400 dark:text-[#C4C7C5]/70 mt-0.5">
            default: {column.default}
          </div>
        )}
      </div>

      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          {badges}
        </div>
      )}
    </div>
  );
};

export default SchemaDesigner;
