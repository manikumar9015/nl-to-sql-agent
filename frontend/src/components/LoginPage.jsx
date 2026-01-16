import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bot, Database, BarChart3, ArrowRight, X, AlertCircle, CheckCircle2, Terminal, Code2, Cpu, ChevronDown } from 'lucide-react';
import api from '../api';

/* -------------------------------------------------------------------------- */
/*                                  UI Components                             */
/* -------------------------------------------------------------------------- */

// Custom Hook for Scroll Animations
const ScrollReveal = ({ children, className = "", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  Main Page                                 */
/* -------------------------------------------------------------------------- */

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
      
      {/* -------------------- Navbar -------------------- */}
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

      {/* -------------------- Hero Section -------------------- */}
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
                onClick={scrollToAuth}
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

      {/* -------------------- Stats Section -------------------- */}
      <section className="py-10 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 text-xl font-bold font-mono"><Database className="w-6 h-6" /> PostgreSQL</div>
          <div className="flex items-center gap-2 text-xl font-bold font-mono"><Terminal className="w-6 h-6" /> MySQL</div>
          <div className="flex items-center gap-2 text-xl font-bold font-mono"><Cpu className="w-6 h-6" /> Google Gemini</div>
          <div className="flex items-center gap-2 text-xl font-bold font-mono"><BarChart3 className="w-6 h-6" /> Recharts</div>
        </div>
      </section>

      {/* -------------------- How It Works -------------------- */}
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

      {/* -------------------- Feature Deep Dive 1: Multi-language NL2SQL -------------------- */}
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

      {/* -------------------- Feature Deep Dive 2: Visuals -------------------- */}
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
              <button onClick={scrollToAuth} className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-2 group">
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

      {/* -------------------- Feature Deep Dive 3: Schema Designer -------------------- */}
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

      {/* -------------------- Footer -------------------- */}
      <footer className="py-20 border-t border-white/10 bg-[#0d0d0d]">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <ScrollReveal>
              <h2 className="text-4xl font-bold mb-6">Ready to talk to your data?</h2>
              <p className="text-gray-400 mb-10 text-lg">Join thousands of developers and analysts using QueryCompass to speed up their workflow.</p>
              <button 
                onClick={scrollToAuth}
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

      {/* -------------------- Auth Modal (Hidden by Default) -------------------- */}
      {showAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#000]/80 backdrop-blur-sm animate-fadeIn" 
            onClick={() => setShowAuth(false)}
          />
          <div className="relative bg-[#1E1F20] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
            <button 
              onClick={() => setShowAuth(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <AuthForm />
          </div>
        </div>
      )}
    </div>
  );
};

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);
  
      try {
        if (isLogin) {
          await login(username, password);
          navigate('/');
        } else {
          await api.post('/auth/register', { username, password });
          await login(username, password);
          navigate('/');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-500/20 mx-auto mb-4">
               Q
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Sign in to access your dashboard' : 'Join QueryCompass today'}
          </p>
        </div>
  
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
  
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none text-white placeholder-gray-600 transition-all font-medium"
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none text-white placeholder-gray-600 transition-all font-medium"
              placeholder="Enter your password"
              required
            />
          </div>
  
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>
  
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-white hover:text-blue-400 font-medium transition-colors cursor-pointer"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    );
  };

export default LoginPage;