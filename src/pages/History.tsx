import { useEffect, useState } from 'react';
import { Clock, CheckCircle, AlertTriangle, XCircle, ChevronRight, Trash2, RotateCcw } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface HistoryItem {
  id: string;
  input_type: string;
  input_content: string;
  result: {
    status: string;
    confidence_score: number;
    title?: string;
  };
  timestamp: string;
}

import Navbar from '../components/Navbar';

const History: React.FC = () => {
  const { token } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/history');
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this analysis?')) return;
    try {
      await api.delete(`/history/${id}`);
      setHistory(history.filter(item => item.id !== id));
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Clear all history? This cannot be undone.')) return;
    try {
      await api.delete('/history');
      setHistory([]);
    } catch (err) {
      alert('Failed to clear history');
    }
  };

  return (
    <div className="min-h-screen bg-dark-deep text-slate-200 selection:bg-primary/30 selection:text-white overflow-x-hidden">
      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[120px] rounded-full" 
        />
      </div>

      <Navbar />

      <main className="relative z-10">
        <div className="container mx-auto px-6 py-12">
          {loading ? (
            <div className="text-center py-24 text-slate-500 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              Loading your history...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-24 text-slate-500 italic flex flex-col items-center gap-4">
              <RotateCcw size={48} className="text-slate-700" />
              No analysis history yet. Start detecting truth!
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                    <Clock size={28} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Recent Analyses</h2>
                    <p className="text-slate-400">View and manage your previous truth scans</p>
                  </div>
                </div>
                <button 
                  onClick={handleClearAll}
                  className="flex items-center gap-2 text-slate-400 hover:text-rose-400 transition-colors text-sm font-bold bg-white/5 px-6 py-3 rounded-2xl border border-white/5"
                >
                  <Trash2 size={16} /> Clear All
                </button>
              </div>
              
              <motion.div 
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08 }
                  }
                }}
                initial="hidden"
                animate="show"
                className="grid gap-6"
              >
                {history.map((item) => (
                  <motion.div 
                    key={item.id}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0 }
                    }}
                    whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                    className="glass p-8 rounded-[2rem] flex items-center justify-between border-l-4 border-l-primary transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-8 z-10">
                      <div className={`p-4 rounded-2xl ${item.result.status === 'REAL' ? 'bg-emerald-500 text-white' : item.result.status === 'FAKE' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>
                        {item.result.status === 'REAL' ? <CheckCircle size={28} /> : item.result.status === 'FAKE' ? <XCircle size={28} /> : <AlertTriangle size={28} />}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors mb-2">
                          {item.result.title || item.input_content.substring(0, 80) + (item.input_content.length > 80 ? '...' : '')}
                        </h4>
                        <div className="flex items-center gap-6 text-sm text-slate-400">
                          <span className="uppercase font-black tracking-widest text-[10px] bg-white/5 px-2 py-1 rounded">{item.result.status}</span>
                          <span className="flex items-center gap-1"><Clock size={14} /> {new Date(item.timestamp).toLocaleDateString()}</span>
                          <span className="font-bold text-slate-300">{item.result.confidence_score}% Confidence</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 z-10">
                      <button 
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        className="p-3 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={20} />
                      </button>
                      <ChevronRight className="text-slate-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-slate-500 text-sm">
        <p>© 2026 TruthLens AI. All rights reserved.</p>
      </footer>
    </div>
  );
};


export default History;
