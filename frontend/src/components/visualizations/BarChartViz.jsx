import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const BarChartViz = ({ data, spec }) => {
  const { title, xAxisKey, yAxisKey } = spec;
  const { theme } = useTheme();

  // Inverted colors: light mode uses black, dark mode uses white
  const axisColor = theme === 'dark' ? '#E3E3E3' : '#000000';
  const gridColor = theme === 'dark' ? '#444746' : '#e4e4e7';
  const barColor = theme === 'dark' ? '#FFFFFF' : '#000000';  // WHITE in dark, BLACK in light
  const tooltipStyle = theme === 'dark' 
    ? { backgroundColor: '#1E1F20', border: '1px solid #444746', color: '#E3E3E3' }
    : { backgroundColor: '#ffffff', border: '1px solid #e4e4e7', color: '#000000' };

  // Ensure the Y-axis value is a number for correct rendering and scaling.
  const processedData = data.map(entry => ({
    ...entry,
    [yAxisKey]: parseInt(entry[yAxisKey], 10),
  }));

  return (
    <div className="p-4 rounded-lg bg-white dark:bg-black transition-colors duration-200 border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold text-black dark:text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={processedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey={xAxisKey} stroke={axisColor} />
          <YAxis stroke={axisColor} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: theme === 'dark' ? '#E3E3E3' : '#000000' }}
            cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
          />
          <Bar dataKey={yAxisKey} fill={barColor} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartViz;