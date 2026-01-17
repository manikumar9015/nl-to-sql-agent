import React from 'react';
import { Database, Bot, BarChart3, Terminal, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

/**
 * FeaturesSection - All feature sections from landing page
 */
const FeaturesSection = ({ onCtaClick }) => {
  return (
    <>
      {/* Stats Section */}
      <section className="py-10 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 text-xl font-bold font-mono"><Database className="w-6 h-6" /> PostgreSQL</div>
          <div className="flex items-center gap-2 text-xl font-bold font-mono"><Terminal className="w-6 h-6" /> MySQL</div>
          <div className="flex items-center gap-2 text-xl font-bold font-mono"><Cpu className="w-6 h-6" /> Google Gemini</div>
          <div className="flex items-center gap-2 text-xl font-bold font-mono"><BarChart3 className="w-6 h-6" /> Recharts</div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">How QueryCompass Works</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Database className="w-8 h-8 text-blue-400" />, title: "1. Connect", desc: "Securely connect your SQL database with read-only access." },
              { icon: <Bot className="w-8 h-8 text-purple-400" />, title: "2. Ask", desc: "Type questions like 'Show me top sales by region' in plain English." },
              { icon: <BarChart3 className="w-8 h-8 text-emerald-400" />, title: "3. Visualize", desc: "Get instant answers, SQL code, and interactive charts." }
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 200}>
                <div className="p-8 rounded-3xl bg-[#1E1F20] border border-white/5 hover:border-white/10 transition-colors h-full">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-language NL2SQL */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-6">
                GLOBAL LANGUAGE SUPPORT
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ask in any language. Seriously.</h2>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Whether you speak English, Spanish, Hindi, or Japanese, QueryCompass understands your intent. Our advanced AI breaks down language barriers to access your data.
              </p>
              <ul className="space-y-4">
                {['Works with 100+ languages usually supported by LLMs', 'Context-aware translation to SQL', 'No specific syntax required - just talk naturally'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-purple-500" /> {item}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>
          <div className="flex-1 w-full">
            <ScrollReveal delay={200}>
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[#0d0d0d]">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="p-6 font-mono text-sm text-gray-300">
                  <div className="flex gap-4 mb-4">
                    <span className="text-blue-400">user:</span>
                    <span>"ಅತಿ ಹೆಚ್ಚು ಮಾರಾಟವಾಗುವ ಉತ್ಪನ್ನಗಳನ್ನು ತೋರಿಸಿ" (Show top selling products)</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-purple-400">agent:</span>
                    <span className="text-emerald-400">
                      SELECT p.name, SUM(s.amount)<br/>
                      FROM products p<br/>
                      JOIN sales s ON p.id = s.product_id<br/>
                      GROUP BY p.id<br/>
                      ORDER BY SUM(s.amount) DESC<br/>
                      LIMIT 5;
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Visualization Feature */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="flex-1">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
                INSTANT VISUALIZATION
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">See the story behind the numbers.</h2>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Raw tables are great, but charts are better. QueryCompass automatically selects the best visualization type for your data—bar charts, line graphs, or pies—instantly.
              </p>
              <button onClick={onCtaClick} className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-2 group">
                Try visualization demo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </ScrollReveal>
          </div>
          <div className="flex-1 w-full">
            <ScrollReveal delay={200}>
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-emerald-500/0 transition-colors" />
                <img src="/feature_viz.png" alt="Visualization Dashboard" className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Schema Designer Feature */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
                VISUAL SCHEMA DESIGNER
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Architect databases without the headache.</h2>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Design complex relationships visually. Drag, drop, and connect tables to create normalized schemas. Then, let AI generate the migration scripts for you.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" /> Interactive Entity-Relationship Diagrams
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" /> AI suggestions for normalization and indexing
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" /> One-click export to SQL
                </li>
              </ul>
            </ScrollReveal>
          </div>
          <div className="flex-1 w-full">
            <ScrollReveal delay={200}>
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-blue-600/0 transition-colors" />
                <img src="/schema_designer_viz.png" alt="Schema Designer Interface" className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturesSection;
