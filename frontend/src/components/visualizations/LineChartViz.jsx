import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const LineChartViz = ({ data, spec }) => {
  const { title, xAxisKey, yAxisKey } = spec;
  const { theme } = useTheme();

  // Inverted colors: light mode uses black, dark mode uses white
  const axisColor = theme === 'dark' ? '#E3E3E3' : '#000000';
  const gridColor = theme === 'dark' ? '#444746' : '#e4e4e7';
  const lineColor = theme === 'dark' ? '#FFFFFF' : '#000000';  // WHITE in dark, BLACK in light
  const tooltipStyle = theme === 'dark' 
    ? { backgroundColor: '#1E1F20', border: '1px solid #444746', color: '#E3E3E3' }
    : { backgroundColor: '#ffffff', border: '1px solid #e4e4e7', color: '#000000' };

  const formatDate = (tickItem) => {
    // ... (this function is fine)
  };
  
  // Use parseFloat to handle potential decimal values (like money).
  const processedData = data.map(entry => ({
    ...entry,
    [yAxisKey]: parseFloat(entry[yAxisKey]),
  }));

  return (
    <div className="p-4 rounded-lg bg-white dark:bg-black transition-colors duration-200 border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold text-black dark:text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={processedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey={xAxisKey} stroke={axisColor} tickFormatter={formatDate} />
          <YAxis stroke={axisColor} />
          <Tooltip
             contentStyle={tooltipStyle}
             labelStyle={{ color: theme === 'dark' ? '#E3E3E3' : '#000000' }}
          />
          <Legend wrapperStyle={{ color: theme === 'dark' ? '#E3E3E3' : '#000000' }} />
          <Line type="monotone" dataKey={yAxisKey} stroke={lineColor} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartViz;