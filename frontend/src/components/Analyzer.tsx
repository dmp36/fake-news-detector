import { useEffect, useState } from 'react';
import { Search, AlertCircle, CheckCircle2, ShieldAlert, Loader2, Link as LinkIcon, FileText, Share2, Award } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

interface Highlight {
  text: string;
  reason: string;
  severity: string;
}

interface AnalysisResult {
  status: 'REAL' | 'FAKE' | 'MISLEADING';
  confidence_score: number;
  reasoning: string;
  highlights: Highlight[];
  title?: string;
  trust_score?: number;
}

interface RealityScoreResult {
  truth_score: number;
  bias_score: number;
  clickbait_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  summary: string;
  detailed_analysis: {
    truth_reason: string;
    bias_reason: string;
    clickbait_reason: string;
  };
}

interface AnalyzerProps {
  initialUrl?: string;
}

const Analyzer: React.FC<AnalyzerProps> = ({ initialUrl }) => {

  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'text' | 'url'>('text');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [realityResult, setRealityResult] = useState<RealityScoreResult | null>(null);
  const [error, setError] = useState('');

  const [factCheck, setFactCheck] = useState(false);

  useEffect(() => {
    if (initialUrl) {
      setInput(initialUrl);
      setInputType('url');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [initialUrl]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const payload = inputType === 'url' ? { url: input } : { text: input };
      
      if (factCheck) {
        const response = await api.post('/analyze/reality', payload);
        setRealityResult(response.data);
      } else {
        const response = await api.post('/analyze', payload);
        setResult(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Something went wrong. Please check your backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (!result) return;
    const text = `TruthLens AI Analysis Report\nStatus: ${result.status}\nConfidence: ${result.confidence_score}%\nReasoning: ${result.reasoning}`;
    navigator.clipboard.writeText(text);
    alert('Analysis report copied to clipboard!');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <div className="glass rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
          <div className="flex gap-4">
            <button 
              onClick={() => setInputType('text')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${inputType === 'text' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <FileText size={18} /> Text
            </button>
            <button 
              onClick={() => setInputType('url')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${inputType === 'url' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <LinkIcon size={18} /> URL
            </button>
          </div>

          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
            <span className="text-sm font-medium text-slate-400">Deep Fact-Check</span>
            <button 
              onClick={() => setFactCheck(!factCheck)}
              className={`w-12 h-6 rounded-full relative transition-colors ${factCheck ? 'bg-emerald-500' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${factCheck ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="relative">
          {inputType === 'text' ? (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste news article content here..."
              className="w-full h-48 bg-dark-lighter/50 border border-white/10 rounded-2xl p-6 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            />
          ) : (
            <input
              type="url"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste article URL here..."
              className="w-full bg-dark-lighter/50 border border-white/10 rounded-2xl p-6 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          )}
          
          <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 ${loading ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-full h-full shimmer" />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="absolute bottom-4 right-4 bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
            {loading ? 'Analyzing...' : 'Analyze Now'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {result && !factCheck && (
          <motion.div 
            key="standard-analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-12 space-y-8"
          >
            {/* Result Header Card */}
            <div className={`p-8 rounded-3xl border ${result.status === 'REAL' ? 'border-emerald-500/30 bg-emerald-500/5' : result.status === 'FAKE' ? 'border-rose-500/30 bg-rose-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${result.status === 'REAL' ? 'bg-emerald-500' : result.status === 'FAKE' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                    {result.status === 'REAL' ? <CheckCircle2 size={32} /> : result.status === 'FAKE' ? <ShieldAlert size={32} /> : <AlertCircle size={32} />}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">{result.status}</h2>
                    <p className="text-slate-400">Confidence Score: {result.confidence_score}%</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {result.trust_score !== undefined && (
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-1 uppercase tracking-wider">
                        <Award size={14} className="text-primary" /> Source Trust
                      </div>
                      <div className="text-xl font-black text-white">{result.trust_score}%</div>
                    </div>
                  )}
                  <button 
                    onClick={handleShare}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-slate-400 hover:text-white"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
              <p className="text-xl text-slate-300 leading-relaxed italic">"{result.reasoning}"</p>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.highlights.map((h, i) => (
                <div key={i} className="glass p-6 rounded-2xl border-l-4 border-l-secondary">
                  <span className="text-secondary text-sm font-bold uppercase tracking-wider block mb-2">{h.severity} risk flagged</span>
                  <p className="text-white font-medium mb-3">"{h.text}"</p>
                  <p className="text-slate-400 text-sm">{h.reason}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {realityResult && factCheck && (
          <motion.div 
            key="reality-analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-12 space-y-8"
          >
            {/* Reality Score Summary Card */}
            <div className={`p-8 rounded-3xl border transition-all ${
              realityResult.risk_level === 'Low' ? 'border-emerald-500/30 bg-emerald-500/5' : 
              realityResult.risk_level === 'Medium' ? 'border-amber-500/30 bg-amber-500/5' : 
              'border-rose-500/30 bg-rose-500/5'
            }`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider ${
                    realityResult.risk_level === 'Low' ? 'bg-emerald-500 text-white' : 
                    realityResult.risk_level === 'Medium' ? 'bg-amber-500 text-white' : 
                    'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  }`}>
                    {realityResult.risk_level} Risk Level
                  </div>
                  <h2 className="text-2xl font-bold text-white">Reality Analysis</h2>
                </div>
                <button 
                  onClick={() => {
                    const text = `Reality Score Analysis\nRisk: ${realityResult.risk_level}\nTruth: ${realityResult.truth_score}\nBias: ${realityResult.bias_score}\nClickbait: ${realityResult.clickbait_score}\nSummary: ${realityResult.summary}`;
                    navigator.clipboard.writeText(text);
                    alert('Reality report copied!');
                  }}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-slate-400 hover:text-white"
                >
                  <Share2 size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  {/* Progress Bars */}
                  <ScoreBar label="Truth Score" score={realityResult.truth_score} />
                  <ScoreBar label="Bias Score" score={realityResult.bias_score} invert />
                  <ScoreBar label="Clickbait Score" score={realityResult.clickbait_score} invert />
                </div>
                
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FileText size={14} className="text-primary" /> Executive Summary
                  </h3>
                  <p className="text-lg text-slate-200 leading-relaxed">
                    {realityResult.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Analysis Breakdown */}
            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <DetailCard title="Factual Consistency" reason={realityResult.detailed_analysis.truth_reason} score={realityResult.truth_score} />
              <DetailCard title="Political Bias" reason={realityResult.detailed_analysis.bias_reason} score={realityResult.bias_score} />
              <DetailCard title="Sensationalism" reason={realityResult.detailed_analysis.clickbait_reason} score={realityResult.clickbait_score} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ScoreBar = ({ label, score, invert = false }: { label: string, score: number, invert?: boolean }) => {
  // Logic: for truth, high is good. for bias/clickbait, low is good.
  const getStatusColor = () => {
    if (invert) {
      if (score < 30) return 'bg-emerald-500';
      if (score < 70) return 'bg-amber-500';
      return 'bg-rose-500';
    } else {
      if (score > 70) return 'bg-emerald-500';
      if (score > 40) return 'bg-amber-500';
      return 'bg-rose-500';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-slate-400">{label}</span>
        <span className="text-sm font-black text-white">{score}%</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${getStatusColor()}`}
        />
      </div>
    </div>
  );
};

const DetailCard = ({ title, reason, score }: { title: string, reason: string, score: number }) => (
  <div className="glass p-6 rounded-2xl border-white/5 hover:border-primary/20 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-slate-200 font-bold">{title}</h3>
      <span className="text-xs font-black px-2 py-1 bg-white/5 rounded-md text-slate-400">{score}%</span>
    </div>
    <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
      {reason}
    </p>
  </div>
);

export default Analyzer;
