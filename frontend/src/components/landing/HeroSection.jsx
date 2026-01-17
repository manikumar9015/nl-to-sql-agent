import React from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

/**
 * HeroSection - Landing page hero section
 */
const HeroSection = ({ onCtaClick }) => {
  return (
    <header className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradients & Image */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-[#131314] to-[#131314] z-10" />
        <img 
          src="/hero_background.png" 
          alt="Background" 
          className="w-full h-full object-cover opacity-60 scale-105 animate-pulse-slow will-change-transform"
          style={{ animationDuration: '20s' }}
        />
      </div>

      <div className="relative z-20 text-center max-w-5xl mx-auto px-6 pt-20">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-8 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            AI-Powered Database Agent
          </div>
        </ScrollReveal>
        
        <ScrollReveal delay={100}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight leading-none">
            Unlock Insights from <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient bg-300%">
              Your Data
            </span>
          </h1>
        </ScrollReveal>
        
        <ScrollReveal delay={200}>
          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Connect to your Postgres database and ask questions in plain English. 
            Let AI handle the complex SQL, visualizations, and schema design for you.
          </p>
        </ScrollReveal>
        
        <ScrollReveal delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onCtaClick}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-105 hover:shadow-blue-500/40 flex items-center gap-2 group cursor-pointer text-lg"
            >
              Start Querying
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all font-semibold hover:border-white/20 text-lg cursor-not-allowed opacity-70">
              View Architecture
            </button>
          </div>
        </ScrollReveal>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <ChevronDown className="w-6 h-6 text-white" />
      </div>
    </header>
  );
};

export default HeroSection;
