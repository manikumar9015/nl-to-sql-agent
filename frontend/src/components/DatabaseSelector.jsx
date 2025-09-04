import React, { useState, useEffect } from 'react';
import { Database, Lock } from 'lucide-react';
import api from '../api'; // Use our central API service

const DatabaseSelector = ({ selectedDb, setSelectedDb, isLocked }) => {
  const [availableDbs, setAvailableDbs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const response = await api.get('/databases');
        setAvailableDbs(response.data);
      } catch (error) {
        console.error("Failed to fetch databases:", error);
        // Handle error, maybe set an error state
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatabases();
  }, []); // The empty array [] means this effect runs only once

  return (
    <div className="flex items-center gap-2">
      <Database size={20} className="text-black" />
      <select
        value={selectedDb}
        onChange={(e) => setSelectedDb(e.target.value)}
        disabled={isLocked || isLoading} // Also disable while loading
        className="border border-zinc-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black disabled:bg-zinc-200 disabled:cursor-not-allowed text-black"
        title={isLocked ? "Database is locked for this conversation." : "Select a database"}
      >
        {isLoading ? (
          <option>Loading...</option>
        ) : (
          availableDbs.map(db => (
            <option key={db} value={db}>{db}</option>
          ))
        )}
      </select>
      {isLocked && <Lock size={20} className="text-black" title="Database locked for this conversation."/>}
    </div>
  );
};

export default DatabaseSelector;