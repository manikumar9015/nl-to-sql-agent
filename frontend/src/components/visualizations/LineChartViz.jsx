import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const LineChartViz = ({ data, spec }) => {
  const { title, xAxisKey, yAxisKey } = spec;

  const formatDate = (tickItem) => {
    // ... (this function is fine)
  };
  
  // --- THE FIX ---
  // Use parseFloat to handle potential decimal values (like money).
  const processedData = data.map(entry => ({
    ...entry,
    [yAxisKey]: parseFloat(entry[yAxisKey]),
  }));
  // --- END FIX ---

  return (
    <div>
      <h3 className="text-lg font-semibold text-black mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={processedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey={xAxisKey} stroke="#000000" tickFormatter={formatDate} />
          <YAxis stroke="#000000" />
          <Tooltip
             contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7' }}
          />
          <Legend />
          <Line type="monotone" dataKey={yAxisKey} stroke="#000000" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartViz;