import React from 'react';
import DataTable from './visualizations/DataTable';
import BarChartViz from './visualizations/BarChartViz';

const SmartVisualizer = ({ visPackage, maskedSample, executionMetadata }) => {
  if (!visPackage) {
    return null; // Don't render anything if there's no visualization package
  }

  const { type, visSpec } = visPackage;
  const { columns } = executionMetadata;

  switch (type) {
    case 'table':
      return <DataTable data={maskedSample} columns={columns} />;
    
    case 'bar':
      return <BarChartViz data={maskedSample} spec={visSpec} />;
    
    // Add cases for 'pie', 'line', 'scalar' here in the future
    
    default:
      return (
        <div className="text-black">
          <p>Visualization type '{type}' is not supported yet.</p>
        </div>
      );
  }
};

export default SmartVisualizer;