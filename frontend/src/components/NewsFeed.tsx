import { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, ShieldCheck, Globe, Copy, Check } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  source: { name: string };
  publishedAt?: string;
}

const CATEGORIES = [
  { id: 'technology', label: 'Tech' },
  { id: 'science', label: 'Science' },
  { id: 'business', label: 'Business' },
  { id: 'health', label: 'Health' },
  { id: 'entertainment', label: 'Entertainment' }
];

interface NewsFeedProps {
  onAnalyze: (url: string) => void;
}


const NewsFeed: React.FC<NewsFeedProps> = ({ onAnalyze }) => {

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('technology');

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/news?category=${activeCategory}`);
        setArticles(response.data);
      } catch (err) {
        console.error('Failed to fetch news', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [activeCategory]);

  if (loading && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Fetching original news...</p>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-6 py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <Newspaper size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">Live News Feed</h2>
            <p className="text-slate-400">Fresh headlines from trusted global sources</p>
          </div>
        </div>

        <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat.id ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
          }
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {articles.map((article: any, i) => (
          <motion.div 
            key={i}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -8, scale: 1.01 }}
            onClick={() => window.open(article.url, '_blank')}
            className="glass flex flex-col rounded-[2rem] border-white/5 hover:border-primary/40 transition-all group overflow-hidden cursor-pointer"
          >
            {/* Article Image */}
            <div className="relative h-48 overflow-hidden">
              <img 
                src={article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80'} 
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-deep via-transparent to-transparent opacity-60" />
              <div className="absolute top-4 left-4 bg-primary/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {article.source.name}
              </div>
              
              {/* Trust Hint Badge */}
              <div className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1">
                <Check size={10} /> {article.trust_hint}% Trust
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-grow flex flex-col">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-3">
                <Globe size={12} />
                <span className="uppercase tracking-tighter font-bold">{activeCategory}</span>
              </div>
              
              <h4 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </h4>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                {article.description?.replace(/<[^>]*>?/gm, '') || "Breaking news report. Analyze this story to verify factual accuracy and detect potential misinformation using TruthLens AI."}
              </p>

              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAnalyze(article.url);
                    }}
                    className="flex items-center gap-2 text-primary text-sm font-black hover:bg-primary/10 px-4 py-2 rounded-xl transition-all"
                  >
                    <ShieldCheck size={16} /> Analyze
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(article.url);
                      alert('Link copied!');
                    }}
                    className="p-2 text-slate-600 hover:text-white transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 text-slate-500 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold"
                >
                  Source <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </motion.div>
        ))}

      </motion.div>
    </section>

  );
};

export default NewsFeed;
