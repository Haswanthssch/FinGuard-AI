import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { getMarketQuotes } from '@/services/marketService';

const initialTickerData = [
  { symbol: 'NIFTY 50', yfSymbol: '^NSEI', price: '22,475.85', pct: '+0.56%', trend: 'up' },
  { symbol: 'SENSEX', yfSymbol: '^BSESN', price: '74,119.39', pct: '+0.48%', trend: 'up' },
  { symbol: 'RELIANCE', yfSymbol: 'RELIANCE.NS', price: '2,950.20', pct: '+0.52%', trend: 'up' },
  { symbol: 'AAPL', yfSymbol: 'AAPL', price: '189.45', pct: '+1.20%', trend: 'up' },
  { symbol: 'BTC', yfSymbol: 'BTC-USD', price: '64,235.10', pct: '+1.97%', trend: 'up' },
  { symbol: 'ETH', yfSymbol: 'ETH-USD', price: '3,450.20', pct: '+1.35%', trend: 'up' },
  { symbol: 'GOLD', yfSymbol: 'GC=F', price: '2,345.20', pct: '+0.53%', trend: 'up' },
  { symbol: 'OIL', yfSymbol: 'CL=F', price: '78.32', pct: '+1.42%', trend: 'up' },
  { symbol: 'USD/INR', yfSymbol: 'INR=X', price: '83.45', pct: '+0.02%', trend: 'up' },
];

export const MarketTicker: React.FC = () => {
  const [tickerData, setTickerData] = useState(initialTickerData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const symbols = initialTickerData.map(d => d.yfSymbol);
        const quotes = await getMarketQuotes(symbols);

        if (Array.isArray(quotes) && quotes.length > 0) {
          const updatedData = initialTickerData.map(item => {
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
          setTickerData(updatedData);
        }
      } catch (error) {
        console.error('Error in MarketTicker fetchData:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white border-b border-gray-100 py-2.5 overflow-hidden sticky top-0 z-[60] backdrop-blur-md shadow-sm">
      <motion.div
        className="flex whitespace-nowrap gap-12 px-4"
        animate={{
          x: [0, -1920],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
        whileHover={{ animationPlayState: 'paused' }}
      >
        {[...tickerData, ...tickerData].map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 group cursor-default">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.symbol}</span>
            <span className="text-sm font-mono font-bold text-gray-900 tracking-tight">{item.price}</span>
            <div className={`flex items-center gap-1 text-[11px] font-bold ${item.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
              <span>{item.pct}</span>
            </div>
            <div className="h-4 w-[1px] bg-gray-100 mx-2" />
          </div>
        ))}
      </motion.div>
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </div>
  );
};
