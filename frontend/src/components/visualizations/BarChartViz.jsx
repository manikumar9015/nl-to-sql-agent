import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BarChartViz = ({ data, spec }) => {
  const { title, xAxisKey, yAxisKey } = spec;

  return (
    <div>
      <h3 className="text-lg font-semibold text-black mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" /> {/* zinc-200 */}
          <XAxis dataKey={xAxisKey} stroke="#000000" />
          <YAxis stroke="#000000" />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7' }}
            labelStyle={{ color: '#000000' }}
          />
          <Bar dataKey={yAxisKey} fill="#000000" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartViz;