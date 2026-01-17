import React from 'react';
import { X } from 'lucide-react';
import AuthForm from './AuthForm';

/**
 * AuthModal - Modal wrapper for authentication form
 */
const AuthModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#000]/80 backdrop-blur-sm animate-fadeIn" 
        onClick={onClose}
      />
      <div className="relative bg-[#1E1F20] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        <AuthForm />
      </div>
    </div>
  );
};

export default AuthModal;
