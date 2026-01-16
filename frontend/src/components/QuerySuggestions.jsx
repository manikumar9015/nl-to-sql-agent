import React from 'react';
import { RefreshCw, Lightbulb, Users } from 'lucide-react';

const QuerySuggestions = ({ suggestions, onSelectSuggestion, onRefresh, isLoading }) => {
  const { getStarted = [], contextual = [], peopleAlsoAsked = [] } = suggestions;

  const renderSuggestionGroup = (title, items, icon) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h3 className="text-sm font-semibold text-gray-700 dark:text-[#E3E3E3]">{title}</h3>
        </div>
        <div className="space-y-1">
          {items.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onSelectSuggestion(suggestion)}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-[#E3E3E3] bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#28292A] rounded-md hover:bg-blue-50 dark:hover:bg-[#28292A] hover:border-blue-300 dark:hover:border-[#A8C7FA] transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-[#131314] h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-[#E3E3E3] flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          Suggested Questions
        </h2>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 hover:bg-gray-200 dark:hover:bg-[#28292A] rounded-md transition-colors"
          title="Refresh suggestions"
        >
         <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-[#C4C7C5] ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">
          Loading suggestions...
        </div>
      ) : (
        <>
          {renderSuggestionGroup(
            "Get Started",
            getStarted,
            <Lightbulb className="w-4 h-4 text-blue-600" />
          )}
          {renderSuggestionGroup(
            "Based on This Conversation",
            contextual,
            <RefreshCw className="w-4 h-4 text-green-600" />
          )}
          {renderSuggestionGroup(
            "People Also Asked",
            peopleAlsoAsked,
            <Users className="w-4 h-4 text-purple-600" />
          )}
        </>
      )}
    </div>
  );
};

export default QuerySuggestions;
