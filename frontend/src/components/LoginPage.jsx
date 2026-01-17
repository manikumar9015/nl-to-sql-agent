import React, { useState, useEffect } from 'react';

// Landing Page Components
import HeroSection from './landing/HeroSection';
import FeaturesSection from './landing/FeaturesSection';
import Footer from './landing/Footer';

// Auth Components
import AuthModal from './auth/AuthModal';

/**
 * LoginPage - Main landing/login page component
 * Refactored to use smaller, focused components
 */
const LoginPage = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle Navbar Scroll Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToAuth = () => setShowAuth(true);

  return (
    <div className="min-h-screen bg-[#131314] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* Navbar */}
      <nav 
        className={`fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between transition-all duration-300 ${
          scrolled ? "bg-[#131314]/80 backdrop-blur-md border-b border-white/5 py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              Q
            </div>
            <span className="text-xl font-bold tracking-tight">QueryCompass</span>
          </div>
          <button 
            onClick={scrollToAuth}
            className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all text-sm font-medium hover:scale-105 active:scale-95"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection onCtaClick={scrollToAuth} />

      {/* Features Sections */}
      <FeaturesSection onCtaClick={scrollToAuth} />

      {/* Footer */}
      <Footer onCtaClick={scrollToAuth} />

      {/* Auth Modal */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
};

export default LoginPage;