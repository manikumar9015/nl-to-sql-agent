import React from 'react';

/**
 * ThinkingSteps Component
 * Displays the current/latest thinking step from the backend SSE stream
 */
const ThinkingSteps = ({ steps = [] }) => {
  // Get only the latest step
  const latestStep = steps.length > 0 ? steps[steps.length - 1] : null;

  return (
    <div className="thinking-container bg-gray-50 border border-gray-200 rounded-lg p-4 my-2">
      <div className="thinking-header text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
        <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
        <span>Processing...</span>
      </div>
      {latestStep && (
        <div className="thinking-step text-sm text-gray-700 pl-6">
          <span className="step-icon text-gray-500 mr-2">→</span>
          <span className="step-text">{latestStep.text}</span>
        </div>
      )}
    </div>
  );
};

export default ThinkingSteps;
