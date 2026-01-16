import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onConfirm, onCancel, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white dark:bg-[#1E1F20] rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 animate-fadeIn transition-colors duration-200 border border-gray-200 dark:border-[#28292A]">
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E3E3E3] text-center mb-2">
          {title}
        </h3>
        
        {/* Message */}
        <p className="text-sm text-gray-600 dark:text-[#C4C7C5] text-center mb-6">
          {message}
        </p>
        
        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#28292A] text-gray-700 dark:text-[#E3E3E3] rounded-lg hover:bg-gray-200 dark:hover:bg-[#3C4043] transition-colors font-medium border border-transparent dark:border-[#3C4043]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors font-medium shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
