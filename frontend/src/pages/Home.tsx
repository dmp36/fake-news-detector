import { useState } from 'react';
import Navbar from '../components/Navbar';
import Analyzer from '../components/Analyzer';
import NewsFeed from '../components/NewsFeed';
import Trending from '../components/Trending';
import { motion } from 'framer-motion';
import { ShieldCheck, Globe, Zap, Database } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedUrl, setSelectedUrl] = useState<string | undefined>(undefined);

  const handleAnalyzeNews = (url: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedUrl(url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-dark-deep text-slate-200 selection:bg-primary/30 selection:text-white overflow-x-hidden">
      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[120px] rounded-full" 
        />
      </div>

      <Navbar />

      <main className="relative z-10">
          <>
            {/* Hero Section */}
            <section className="container mx-auto px-6 pt-16 pb-8 text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight"
              >
                Detect <span className="gradient-text">Truth</span> in Seconds.
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
              >
                Our AI-powered engine scrutinizes news patterns, clickbait language, and factual consistency to keep you informed.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap justify-center gap-4 mb-12"
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-sm text-slate-400">
                  <ShieldCheck className="text-emerald-500" size={16} /> Verified by GPT-4o
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-sm text-slate-400">
                  <Zap className="text-amber-500" size={16} /> Instant Results
                </div>
              </motion.div>
              
              {!isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="glass max-w-lg mx-auto p-8 rounded-3xl border-primary/20 bg-primary/5"
                >
                  <h3 className="text-2xl font-bold text-white mb-4">Ready to scan?</h3>
                  <p className="text-slate-400 mb-6">Please login or create an account to start analyzing articles and view your history.</p>
                  <Link 
                    to="/login"
                    className="bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-primary/30 transition-all hover:scale-105 inline-block"
                  >
                    Login to Start Detecting
                  </Link>
                </motion.div>
              )}
            </section>

            {/* Analyzer Component - Protected */}
            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Analyzer initialUrl={selectedUrl} />
              </motion.div>
            )}

            {/* Original News Feed */}
            <NewsFeed onAnalyze={handleAnalyzeNews} />

            {/* Features Section */}
            <motion.section 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.2 }
                }
              }}
              className="container mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-12"
            >
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
                whileHover={{ y: -10 }}
                className="space-y-4 p-8 rounded-3xl glass hover:bg-white/5 transition-all"
              >
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Globe size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Global Coverage</h3>
                  <p className="text-slate-400">Analyze news from any major global source or local publisher in real-time.</p>
              </motion.div>
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
                whileHover={{ y: -10 }}
                className="space-y-4 p-8 rounded-3xl glass hover:bg-white/5 transition-all"
              >
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                    <Zap size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Instant Analysis</h3>
                  <p className="text-slate-400">Powered by GPT-4o and custom ML models for sub-second classification latency.</p>
              </motion.div>
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
                whileHover={{ y: -10 }}
                className="space-y-4 p-8 rounded-3xl glass hover:bg-white/5 transition-all"
              >
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                    <Database size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Verification Engine</h3>
                  <p className="text-slate-400">Cross-checks claims against a massive database of verified facts and trusted sources.</p>
              </motion.div>
            </motion.section>

            {/* Trending Section */}
            <Trending />
          </>
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-slate-500 text-sm">
        <p>© 2026 TruthLens AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;

