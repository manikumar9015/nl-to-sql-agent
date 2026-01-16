import React from 'react';

const DataTable = ({ data, columns }) => {
  if (!data || data.length === 0) {
    return <p className="text-black">No data to display.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-gray-800">
      <table className="min-w-full bg-white dark:bg-black text-black dark:text-white">
        <thead>
          <tr className="bg-zinc-100 dark:bg-[#1E1F20]">
            {columns.map((col) => (
              <th key={col} className="p-3 border-b border-zinc-200 dark:border-gray-700 text-left text-sm font-semibold text-black dark:text-gray-200 uppercase tracking-wider">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-gray-800">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-zinc-50 dark:hover:bg-[#1E1F20] transition-colors">
              {columns.map((col) => (
                <td key={col} className="p-3 text-sm text-black dark:text-gray-300 whitespace-nowrap">
                  {/* Handle date formatting if necessary in the future */}
                  {String(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;