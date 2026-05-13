import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, TrendingUp, TrendingDown } from 'lucide-react';
import { getMarketQuotes } from '@/services/marketService';

const initialAssets = [
  { name: 'Gold', symbol: 'Gold', yfSymbol: 'GC=F', price: '2,345.20', pct: '+1.24%', trend: 'up', color: '#fbbf24' },
  { name: 'Silver', symbol: 'Silver', yfSymbol: 'SI=F', price: '28.45', pct: '-0.45%', trend: 'down', color: '#94a3b8' },
  { name: 'Crude Oil', symbol: 'Crude Oil', yfSymbol: 'CL=F', price: '78.32', pct: '+2.10%', trend: 'up', color: '#334155' },
  { name: 'Bitcoin', symbol: 'BTC', yfSymbol: 'BTC-USD', price: '64,235', pct: '+3.42%', trend: 'up', color: '#f59e0b' },
  { name: 'Ethereum', symbol: 'ETH', yfSymbol: 'ETH-USD', price: '3,452', pct: '+2.85%', trend: 'up', color: '#6366f1' },
  { name: 'Nasdaq 100', symbol: 'Nasdaq 100', yfSymbol: 'QQQ', price: '18,245', pct: '+0.85%', trend: 'up', color: '#3b82f6' },
];

export const GlobalAssets: React.FC = () => {
  const [assets, setAssets] = useState(initialAssets);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const symbols = initialAssets.map(a => a.yfSymbol);
        const quotes = await getMarketQuotes(symbols);
        
        if (quotes && quotes.length > 0) {
          const updatedAssets = initialAssets.map(item => {
            const quote = quotes.find(q => q.symbol === item.yfSymbol);
            if (quote) {
              return {
                ...item,
                price: quote.price.toLocaleString(undefined, { minimumFractionDigits: 2 }),
                pct: `${quote.percent_change >= 0 ? '+' : ''}${quote.percent_change.toFixed(2)}%`,
                trend: quote.trend,
              };
            }
            return item;
          });
          setAssets(updatedAssets);
        }
      } catch (error) {
        console.error('Error in GlobalAssets fetchAssets:', error);
      }
    };

    fetchAssets();
    const interval = setInterval(fetchAssets, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
            <Globe className="text-blue-600" size={20} />
          </div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Macro Telemetry</span>
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-12">Global <span className="text-blue-600">Asset Monitor</span></h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {assets.map((asset, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-white border border-gray-100 rounded-2xl p-6 relative overflow-hidden group shadow-sm hover:shadow-xl hover:border-blue-100 transition-all"
            >
              <div 
                className="absolute -top-10 -right-10 w-24 h-24 blur-[50px] opacity-10"
                style={{ backgroundColor: asset.color }}
              />
              
              <div className="relative z-10">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{asset.name}</div>
                <div className="text-lg font-bold text-gray-900 mb-4">{asset.symbol}</div>
                
                <div className="text-2xl font-mono font-bold text-gray-900 mb-1">${asset.price}</div>
                <div className={`flex items-center gap-1 text-[13px] font-bold ${asset.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                   {asset.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                   {asset.pct}
                </div>

                <div className="mt-6 flex gap-1 h-8 items-end opacity-20">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-full bg-gray-400 rounded-t-[1px]" 
                      style={{ height: `${Math.random() * 60 + 40}%` }}
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
