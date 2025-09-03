import React from 'react';
import DatabaseSelector from './DatabaseSelector';

const Header = ({ selectedDb, setSelectedDb, isLocked }) => {
  return (
    <header className="p-4 border-b border-zinc-200 flex-shrink-0 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-black">Local Data Lab</h1>
      <DatabaseSelector 
        selectedDb={selectedDb} 
        setSelectedDb={setSelectedDb}
        isLocked={isLocked}
      />
    </header>
  );
};

export default Header;