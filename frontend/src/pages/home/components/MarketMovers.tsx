import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { getMarketQuotes } from '@/services/marketService';

const initialMovers = [
  { symbol: 'ADANI POWER', yfSymbol: 'ADANIPOWER.NS', name: 'Adani Power Ltd', price: '612.45', change: '+24.15', pct: '+4.11%', vol: '12.4M', trend: 'up' },
  { symbol: 'ZOMATO', yfSymbol: 'ZOMATO.NS', name: 'Zomato Ltd', price: '198.20', change: '+6.40', pct: '+3.34%', vol: '45.1M', trend: 'up' },
  { symbol: 'VEDL', yfSymbol: 'VEDL.NS', name: 'Vedanta Ltd', price: '452.10', change: '+12.30', pct: '+2.80%', vol: '8.2M', trend: 'up' },
  { symbol: 'SUNPHARMA', yfSymbol: 'SUNPHARMA.NS', name: 'Sun Pharma', price: '1,540.30', change: '-42.50', pct: '-2.68%', vol: '3.1M', trend: 'down' },
  { symbol: 'TITAN', yfSymbol: 'TITAN.NS', name: 'Titan Company', price: '3,210.00', change: '-65.40', pct: '-1.98%', vol: '1.2M', trend: 'down' },
  { symbol: 'KOTAKBANK', yfSymbol: 'KOTAKBANK.NS', name: 'Kotak Bank', price: '1,680.45', change: '-28.20', pct: '-1.65%', vol: '4.8M', trend: 'down' },
];

export const MarketMovers: React.FC = () => {
  const [movers, setMovers] = useState(initialMovers);

  useEffect(() => {
    const fetchMovers = async () => {
      try {
        const symbols = initialMovers.map(m => m.yfSymbol);
        const quotes = await getMarketQuotes(symbols);
        
        if (quotes && quotes.length > 0) {
          const updatedMovers = initialMovers.map(item => {
            const quote = quotes.find(q => q.symbol === item.yfSymbol);
            if (quote) {
              return {
                ...item,
                price: quote.price.toLocaleString(undefined, { minimumFractionDigits: 2 }),
                change: `${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)}`,
                pct: `${quote.percent_change >= 0 ? '+' : ''}${quote.percent_change.toFixed(2)}%`,
                trend: quote.trend,
              };
            }
            return item;
          });
          setMovers(updatedMovers);
        }
      } catch (error) {
        console.error('Error in MarketMovers fetchMovers:', error);
      }
    };

    fetchMovers();
    const interval = setInterval(fetchMovers, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-[#F8FAFC] border-t border-gray-100">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                <Activity className="text-blue-600" size={20} />
              </div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Active Markets</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">Top <span className="text-blue-600">Market Movers</span></h2>
            <p className="text-gray-500 mt-2 font-medium">Real-time leaders and laggards across major indices.</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            {['NIFTY 50', 'BANK NIFTY', 'MIDCAP'].map((tab) => (
              <button 
                key={tab}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
                  tab === 'NIFTY 50' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movers.map((stock, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-gray-100 rounded-3xl p-6 relative overflow-hidden group shadow-sm hover:shadow-xl hover:border-blue-100 transition-all"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] -z-0 opacity-10 ${stock.trend === 'up' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{stock.symbol}</h3>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{stock.name}</p>
                  </div>
                  <div className={`p-2 rounded-xl ${stock.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {stock.trend === 'up' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-mono font-bold text-gray-900">₹{stock.price}</div>
                    <div className={`text-sm font-bold flex items-center gap-1 mt-1 ${stock.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {stock.change} ({stock.pct})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Volume</div>
                    <div className="text-sm font-bold text-gray-700">{stock.vol}</div>
                  </div>
                </div>

                {/* Mini Sparkline Placeholder */}
                <div className="h-12 w-full mt-6 bg-gray-50 rounded-lg border border-gray-100 flex items-end px-2 pb-1 gap-1">
                   {[...Array(12)].map((_, i) => (
                     <div 
                        key={i} 
                        className={`w-full rounded-t-sm ${stock.trend === 'up' ? 'bg-emerald-500/30' : 'bg-rose-500/30'}`} 
                        style={{ height: `${Math.random() * 80 + 20}%` }} 
                     />
                   ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
