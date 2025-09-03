import React from 'react';

const DataTable = ({ data, columns }) => {
  if (!data || data.length === 0) {
    return <p className="text-black">No data to display.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-zinc-200">
        <thead>
          <tr className="bg-zinc-200">
            {columns.map((col) => (
              <th key={col} className="p-2 border-b border-zinc-200 text-left text-sm font-semibold text-black">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-zinc-200">
              {columns.map((col) => (
                <td key={col} className="p-2 border-b border-zinc-200 text-sm text-black">
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