import React from 'react';

const SchemaLoadingSkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-zinc-300 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-5 bg-zinc-300 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-zinc-200 rounded w-3/4"></div>
        </div>
      </div>

      {/* Table skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg border border-zinc-200 p-4">
          {/* Table name */}
          <div className="h-5 bg-zinc-300 rounded w-1/3 mb-3"></div>
          
          {/* Columns */}
          <div className="space-y-2">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="w-3 h-3 bg-zinc-200 rounded-full"></div>
                <div className="flex-1 h-4 bg-zinc-200 rounded"></div>
                <div className="w-16 h-4 bg-zinc-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Animated text */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 text-zinc-500 text-sm">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="font-medium">Generating schema...</span>
        </div>
      </div>
    </div>
  );
};

export default SchemaLoadingSkeleton;
