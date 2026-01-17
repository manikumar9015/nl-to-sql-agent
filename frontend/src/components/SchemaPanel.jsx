import React from 'react';
import SchemaDesigner from './SchemaDesigner';
import SchemaLoadingSkeleton from './SchemaLoadingSkeleton';

/**
 * Schema Designer Panel component - displayed alongside chat in schema mode
 */
const SchemaPanel = ({
  currentSchema,
  isLoading,
  schemaComplete,
  onCreateClick,
  panelWidth,
}) => {
  return (
    <div 
      className="flex flex-col bg-zinc-50 dark:bg-[#1E1F20] border-l border-zinc-200 dark:border-[#28292A]"
      style={{ width: `${100 - panelWidth}%` }}
    >
      {/* Sticky Header */}
      <div className="border-b border-zinc-200 dark:border-[#28292A] bg-white dark:bg-[#131314] p-4 flex items-center justify-between flex-shrink-0">
        <h3 className="font-semibold text-zinc-900 dark:text-[#E3E3E3] flex items-center gap-2">
          <span className="w-1 h-4 bg-zinc-900 dark:bg-[#E3E3E3] rounded-full"></span>
          Current Schema
        </h3>
        {schemaComplete && !isLoading && (
          <button
            onClick={onCreateClick}
            className="px-4 py-2 bg-black dark:bg-[#A8C7FA] text-white dark:text-[#131314] rounded-lg hover:bg-zinc-800 dark:hover:bg-[#8AB4F8] transition-all font-medium text-sm shadow-sm hover:shadow flex items-center gap-2"
          >
            <span>🗄️</span> Create Database
          </button>
        )}
      </div>
      
      {/* Scrollable Schema Content */}
      <div className="flex-1 overflow-y-auto p-4 scollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-[#28292A] hover:scrollbar-thumb-zinc-300 dark:hover:scrollbar-thumb-[#3C4043]">
        {isLoading && !currentSchema ? (
          <SchemaLoadingSkeleton />
        ) : (
          <SchemaDesigner schema={currentSchema} />
        )}
      </div>
    </div>
  );
};

export default SchemaPanel;
