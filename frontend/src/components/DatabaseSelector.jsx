import React from 'react';
import { Database, Lock } from 'lucide-react';

const DatabaseSelector = ({ selectedDb, setSelectedDb, isLocked }) => {
  // In the future, this list would be fetched from the GET /api/databases endpoint
  const availableDbs = ['sales_db', 'marketing_db', 'support_tickets_db'];

  return (
    <div className="flex items-center gap-2">
      <Database size={20} className="text-black" />
      <select
        value={selectedDb}
        onChange={(e) => setSelectedDb(e.target.value)}
        disabled={isLocked}
        className="border border-zinc-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black disabled:bg-zinc-200 disabled:cursor-not-allowed text-black"
        title={isLocked ? "Database is locked for this conversation." : "Select a database"}
      >
        {availableDbs.map(db => (
          <option key={db} value={db}>{db}</option>
        ))}
      </select>
      {isLocked && <Lock size={20} className="text-black" title="Database locked for this conversation."/>}
    </div>
  );
};

export default DatabaseSelector;