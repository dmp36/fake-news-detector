import { useEffect, useState } from 'react';
import { Flame, ExternalLink } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';

interface TrendingStory {
  title: string;
  status: string;
  summary: string;
  source: string;
}

const Trending: React.FC = () => {
  const [stories, setStories] = useState<TrendingStory[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await api.get('/trending');
        setStories(response.data);
      } catch (err) {
        console.error('Failed to fetch trending stories', err);
      }
    };
    fetchTrending();
  }, []);

  if (stories.length === 0) return null;

  return (
    <section className="container mx-auto px-6 py-24 border-t border-white/5">
      <div className="flex items-center gap-3 mb-12">
        <div className="p-2 bg-orange-500/20 text-orange-500 rounded-lg">
          <Flame size={24} />
        </div>
        <h2 className="text-3xl font-black text-white">Trending Debunks</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stories.map((story, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass p-6 rounded-3xl border-white/5 hover:border-primary/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${story.status === 'FAKE' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {story.status}
              </span>
              <span className="text-slate-600 text-xs">{story.source}</span>
            </div>
            <h4 className="text-lg font-bold text-white mb-3 group-hover:text-primary transition-colors">{story.title}</h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">{story.summary}</p>
            <button 
              onClick={() => window.open(`https://www.google.com/search?q=fact+check+${encodeURIComponent(story.title)}`, '_blank')}
              className="flex items-center gap-2 text-primary text-xs font-bold hover:underline"
            >
              Read Verification <ExternalLink size={14} />
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Trending;
