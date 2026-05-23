import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Loader2, AlertCircle, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/register', formData);
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const status = err.response?.status;
      const message = typeof detail === 'string'
        ? detail
        : status
          ? `Registration failed with server error ${status}. Check the Vercel Function logs.`
          : 'Registration failed because the API could not be reached.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-deep flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-float" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-3s' }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-md rounded-[2.5rem] p-10 relative z-10 border-white/5"
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="register-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex flex-col items-center mb-8">
                <Link to="/" className="flex items-center gap-2 group mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                    <ShieldCheck className="text-white" size={28} />
                  </div>
                  <span className="text-2xl font-black tracking-tight text-white">TruthLens<span className="text-secondary">AI</span></span>
                </Link>
                <h2 className="text-3xl font-black text-white text-center">Create Account</h2>
                <p className="text-slate-400 mt-2 text-center">Join TruthLens AI to track truth in real-time</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="Username"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-rose-400 text-sm bg-rose-400/10 p-4 rounded-2xl border border-rose-400/20"
                  >
                    <AlertCircle size={18} /> {error}
                  </motion.div>
                )}

                <button
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-slate-400 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary font-black hover:text-primary-light transition-colors">
                    Login Here
                  </Link>
                </p>
              </div>

              <Link 
                to="/" 
                className="mt-8 flex items-center justify-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold"
              >
                <ArrowLeft size={16} /> Back to Home
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="success-message"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 text-emerald-500">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Success!</h2>
              <p className="text-slate-400">Account created successfully.<br />Redirecting to login...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Register;
