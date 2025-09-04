import React from 'react';
import DataTable from './visualizations/DataTable';
import BarChartViz from './visualizations/BarChartViz';
import PieChartViz from './visualizations/PieChartViz';   // <-- IMPORT
import LineChartViz from './visualizations/LineChartViz'; // <-- IMPORT

const ScalarViz = ({ spec, metadata }) => (
  <div className="text-center p-4">
    <h3 className="text-lg font-semibold text-black">{spec.title}</h3>
    <p className="text-4xl font-bold text-black">{metadata.rowCount}</p>
  </div>
);

const SmartVisualizer = ({ visPackage, maskedSample, executionMetadata }) => {
  if (!visPackage) {
    return null;
  }

  const { type, visSpec } = visPackage;
  const { columns } = executionMetadata;

  switch (type) {
    case 'table':
      return <DataTable data={maskedSample} columns={columns} />;
    
    case 'bar':
      return <BarChartViz data={maskedSample} spec={visSpec} />;
    
    // --- ADD THE NEW CASES ---
    case 'pie':
      return <PieChartViz data={maskedSample} spec={visSpec} />;

    case 'line':
      return <LineChartViz data={maskedSample} spec={visSpec} />;
    // -------------------------
    
    case 'scalar':
      return <ScalarViz spec={visSpec} metadata={executionMetadata} />;
    
    default:
      return (
        <div className="text-black">
          <p>Visualization type '{type}' is not supported yet.</p>
        </div>
      );
  }
};

export default SmartVisualizer;