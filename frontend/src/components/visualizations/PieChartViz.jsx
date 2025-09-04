import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#000000', '#666666', '#999999', '#CCCCCC'];

const PieChartViz = ({ data, spec }) => {
  const { title, xAxisKey, yAxisKey } = spec;

  // --- THIS IS THE FIX ---
  // The recharts library needs the value dataKey to be a number.
  // We map over the data to parse the string value into an integer.
  const processedData = data.map(entry => ({
    ...entry,
    [yAxisKey]: parseInt(entry[yAxisKey], 10),
  }));
  // --- END FIX ---

  return (
    <div>
      <h3 className="text-lg font-semibold text-black mb-2 text-center">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            // Use the new, processed data
            data={processedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey={yAxisKey}
            nameKey={xAxisKey}
            label={(entry) => entry[xAxisKey]}
          >
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
             contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartViz;