import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

// Light mode: blacks and grays
const LIGHT_COLORS = ['#000000', '#666666', '#999999', '#CCCCCC'];

// Dark mode: whites and light grays (inverted)
const DARK_COLORS = ['#FFFFFF', '#B3B3B3', '#999999', '#666666'];

const PieChartViz = ({ data, spec }) => {
  const { title, xAxisKey, yAxisKey } = spec;
  const { theme } = useTheme();

  const currentColors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  const tooltipStyle = theme === 'dark' 
    ? { backgroundColor: '#1E1F20', border: '1px solid #444746', color: '#E3E3E3' }
    : { backgroundColor: '#ffffff', border: '1px solid #e4e4e7', color: '#000000' };

  // The recharts library needs the value dataKey to be a number.
  const processedData = data.map(entry => ({
    ...entry,
    [yAxisKey]: parseInt(entry[yAxisKey], 10),
  }));

  return (
    <div className="p-4 rounded-lg bg-white dark:bg-black transition-colors duration-200 border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold text-black dark:text-white mb-4 text-center">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
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
              <Cell key={`cell-${index}`} fill={currentColors[index % currentColors.length]} />
            ))}
          </Pie>
          <Tooltip
             contentStyle={tooltipStyle}
             itemStyle={{ color: theme === 'dark' ? '#E3E3E3' : '#000000' }}
          />
          <Legend wrapperStyle={{ color: theme === 'dark' ? '#E3E3E3' : '#000000' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartViz;