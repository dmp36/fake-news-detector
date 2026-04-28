import { useState } from 'react';
import { ShieldCheck, Globe, LogOut, User as UserIcon, History as HistoryIcon, Menu, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { logout, isAuthenticated, username } = useAuth();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="container mx-auto px-6 py-8 flex justify-between items-center relative z-20">
      <Link to="/" className="flex items-center gap-2 group cursor-pointer">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
          <ShieldCheck className="text-white" size={24} />
        </div>
        <span className="text-2xl font-black tracking-tight text-white">TruthLens<span className="text-secondary">AI</span></span>
      </Link>
      
      {/* Mobile Menu Toggle */}
      <button 
        className="md:hidden p-2 text-white bg-white/5 rounded-xl border border-white/10"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
        <Link to="/" className={`hover:text-white transition-colors ${isActive('/') ? 'text-white' : ''}`}>Analyze</Link>
        <Link 
          to={isAuthenticated ? "/history" : "/login"} 
          className={`hover:text-white transition-colors flex items-center gap-1 ${isActive('/history') ? 'text-white' : ''}`}
        >
          History <HistoryIcon size={14} />
        </Link>
        <a 
          href="http://localhost:8000/docs" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-white transition-colors flex items-center gap-1"
        >
          API Docs <Globe size={14} />
        </a>
        
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-primary border border-white/10">
                <UserIcon size={16} />
              </div>
              {username && <span className="text-white font-bold">{username}</span>}
            </div>
            <button 
              onClick={logout}
              className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-2"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <Link 
            to="/login"
            className="bg-white/5 hover:bg-white/10 text-white px-8 py-2.5 rounded-full border border-white/10 transition-all font-bold"
          >
            Get Started
          </Link>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-24 left-6 right-6 md:hidden glass rounded-3xl overflow-hidden border-white/10 shadow-2xl"
          >
            <div className="flex flex-col p-4 gap-4 text-sm font-medium">
              <Link 
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-4 text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
              >
                <Zap size={18} className="text-primary" /> Analyze Articles
              </Link>
              <Link 
                to="/history"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-4 text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
              >
                <HistoryIcon size={18} className="text-secondary" /> My History
              </Link>
              <a 
                href="http://localhost:8000/docs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
              >
                <Globe size={18} className="text-emerald-500" /> API Documentation
              </a>
              
              <div className="border-t border-white/5 pt-4">
                {isAuthenticated ? (
                  <button 
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 p-4 text-rose-400 hover:bg-rose-500/5 rounded-2xl transition-all font-bold"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                ) : (
                  <Link 
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-primary text-white rounded-2xl transition-all font-bold"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
