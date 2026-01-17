import React from 'react';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

/**
 * Footer - Landing page footer section
 */
const Footer = ({ onCtaClick }) => {
  return (
    <footer className="py-20 border-t border-white/10 bg-[#0d0d0d]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <ScrollReveal>
          <h2 className="text-4xl font-bold mb-6">Ready to talk to your data?</h2>
          <p className="text-gray-400 mb-10 text-lg">
            Join thousands of developers and analysts using QueryCompass to speed up their workflow.
          </p>
          <button 
            onClick={onCtaClick}
            className="px-10 py-5 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors shadow-xl hover:shadow-2xl hover:-translate-y-1 transform active:scale-95"
          >
            Get Started for Free
          </button>
        </ScrollReveal>
        <div className="mt-20 flex justify-center gap-8 text-sm text-gray-500">
          <span>© 2026 QueryCompass</span>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
