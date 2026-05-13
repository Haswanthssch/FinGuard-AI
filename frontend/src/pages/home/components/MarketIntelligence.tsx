import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Clock, ExternalLink } from 'lucide-react';
import { getMarketNews } from '@/services/finnhubService';

interface NewsItem {
  stock: string;
  headline: string;
  sentiment: 'Bullish' | 'Bearish' | 'Volatile' | 'Neutral';
  sector: string;
  time: string;
  source: string;
  url: string;
}

const getSentiment = (headline: string): 'Bullish' | 'Bearish' | 'Neutral' => {
  const lower = headline.toLowerCase();
  if (lower.includes('up') || lower.includes('gain') || lower.includes('rise') || lower.includes('high') || lower.includes('profit') || lower.includes('jump')) return 'Bullish';
  if (lower.includes('down') || lower.includes('loss') || lower.includes('fall') || lower.includes('low') || lower.includes('dip') || lower.includes('slump')) return 'Bearish';
  return 'Neutral';
};

export const MarketIntelligence: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getMarketNews('general');
        if (Array.isArray(data)) {
          const mappedNews: NewsItem[] = data.slice(0, 8).map((item: any) => ({
            stock: item.related || 'MARKET',
            headline: item.headline,
            sentiment: getSentiment(item.headline) as any,
            sector: 'General',
            time: new Date(item.datetime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: item.source,
            url: item.url,
          }));
          setNews(mappedNews);
        }
      } catch (error) {
        console.error('Error fetching market news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <section className="py-24 border-t border-gray-100 bg-white">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                <Newspaper className="text-blue-600" size={20} />
              </div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Live Updates</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">AI Curated <span className="text-blue-600">Market Intelligence</span></h2>
            <p className="text-gray-500 mt-2 font-medium">Real-time sentiment analysis of global and local market-moving events.</p>
          </div>
          <button className="px-6 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-bold hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all shadow-sm">
            View All Intelligence
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[400px] h-[200px] bg-gray-50 border border-gray-100 rounded-2xl animate-pulse" />
            ))
          ) : news.length > 0 ? (
            news.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                onClick={() => window.open(item.url, '_blank')}
                className="min-w-[400px] bg-white border border-gray-100 rounded-2xl p-6 flex flex-col justify-between group cursor-pointer shadow-sm hover:shadow-xl hover:border-blue-100 transition-all"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{item.stock}</span>
                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                      item.sentiment === 'Bullish' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      item.sentiment === 'Bearish' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                      'bg-gray-50 text-gray-600 border border-gray-100'
                    }`}>
                      {item.sentiment}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-6 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                    {item.headline}
                  </h3>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                      <Clock size={12} />
                      {item.time}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                      <span className="w-1 h-1 rounded-full bg-gray-200" />
                      {item.source}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                    <ExternalLink size={14} />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-gray-400 font-bold p-8 italic">No news available at the moment.</div>
          )}
        </div>
      </div>
    </section>
  );
};
