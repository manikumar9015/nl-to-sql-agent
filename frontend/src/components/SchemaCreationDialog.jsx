import React, { useState } from 'react';
import { Database, AlertCircle, CheckCircle, Code, X } from 'lucide-react';

/**
 * Schema Creation Dialog
 * Modal for finalizing and creating the database
 */
const SchemaCreationDialog = ({ schema, onClose, onConfirm }) => {
  const [dbName, setDbName] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [showDDL, setShowDDL] = useState(false);
  const [ddl, setDDL] = useState('');
  const [loadingDDL, setLoadingDDL] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Fetch DDL preview
  const fetchDDLPreview = async () => {
    if (!dbName.trim()) {
      setError('Please enter a database name');
      return;
    }

    setLoadingDDL(true);
    setError('');

    try {
      const response = await fetch('/api/schema/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ dbName, schema }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate DDL preview');
      }

      const data = await response.json();
      setDDL(data.ddl);
      setShowDDL(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDDL(false);
    }
  };

  // Handle database creation
  const handleCreate = async () => {
    if (!dbName.trim()) {
      setError('Please enter a database name');
      return;
    }

    if (!confirmed) {
      setError('Please confirm that you understand the database will be created');
      return;
    }

    setCreating(true);
    setError('');

    try {
      await onConfirm(dbName);
      // Parent component handles success and closes dialog
    } catch (err) {
      setError(err.message || 'Failed to create database');
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-zinc-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-900 to-black px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-zinc-300" />
            <h2 className="text-xl font-bold text-white">Create Database</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-zinc-50/50">
          {/* Schema Summary */}
          <div className="mb-6 p-4 bg-white rounded-lg border border-zinc-200 shadow-sm">
            <h3 className="font-semibold text-zinc-900 mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-black rounded-full"></span>
              Schema Summary
            </h3>
            <div className="text-sm text-zinc-600 space-y-2 pl-3">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-zinc-100 rounded text-xs">📋</span> <strong>{schema.tables.length}</strong> tables
              </div>
              <div className="flex items-center gap-2">
                <span className="p-1 bg-zinc-100 rounded text-xs">📝</span> <strong>{schema.tables.reduce((sum, t) => sum + t.columns.length, 0)}</strong> total columns
              </div>
              <div className="flex items-center gap-2">
                <span className="p-1 bg-zinc-100 rounded text-xs">🔗</span> <strong>
                  {schema.tables.reduce((sum, t) => 
                    sum + t.columns.filter(c => c.foreignKey).length, 0
                  )}
                </strong> foreign key relationships
              </div>
            </div>
          </div>

          {/* Database Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Database Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={dbName}
              onChange={(e) => {
                setDbName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                setError('');
              }}
              placeholder="my_new_database"
              className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black font-mono shadow-sm transition-all"
              disabled={creating}
            />
            <p className="text-xs text-zinc-500 mt-1.5 ml-1">
              Use lowercase letters, numbers, and underscores only
            </p>
          </div>

          {/* Confirmation Checkbox */}
          <div className="mb-6 p-4 bg-amber-50/50 border border-amber-100 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 text-black border-zinc-300 rounded focus:ring-black"
                disabled={creating}
              />
              <div className="text-sm text-zinc-700 leading-relaxed">
                I understand that this will create a new database named <strong className="font-mono text-black bg-white px-1 py-0.5 rounded border border-zinc-200">{dbName || '...'}</strong> with the schema shown above. This action cannot be undone.
              </div>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-rose-800 font-medium">{error}</div>
            </div>
          )}

          {/* Warning */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Note:</strong> Make sure the PostgreSQL admin user has CREATE DATABASE privileges.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex gap-3 justify-end items-center">
          <button
            onClick={onClose}
            disabled={creating}
            className="px-4 py-2 bg-white border border-zinc-300 text-zinc-700 font-medium rounded-lg hover:bg-zinc-50 hover:border-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!dbName.trim() || !confirmed || creating}
            className="px-5 py-2 bg-black text-white font-medium rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            {creating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Create Database
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchemaCreationDialog;
