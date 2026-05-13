import React from 'react';
import { motion } from 'framer-motion';
import { Layers, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const sectors = [
  { name: 'IT', perf: '+2.45%', status: 'Bullish', inflow: 'High', color: '#3b82f6' },
  { name: 'Banking', perf: '+1.80%', status: 'Bullish', inflow: 'Stable', color: '#10b981' },
  { name: 'Pharma', perf: '+0.95%', status: 'Neutral', inflow: 'Moderate', color: '#8b5cf6' },
  { name: 'Energy', perf: '-1.20%', status: 'Bearish', inflow: 'Outflow', color: '#ef4444' },
  { name: 'Auto', perf: '+0.45%', status: 'Neutral', inflow: 'Stable', color: '#f59e0b' },
  { name: 'FMCG', perf: '+1.15%', status: 'Bullish', inflow: 'High', color: '#06b6d4' },
  { name: 'Infra', perf: '-0.30%', status: 'Neutral', inflow: 'Outflow', color: '#f43f5e' },
  { name: 'Defence', perf: '+3.40%', status: 'Bullish', inflow: 'V. High', color: '#14b8a6' },
];

export const SectorHeatmap: React.FC = () => {
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                <Layers className="text-blue-600" size={20} />
              </div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Sectoral Intelligence</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">Sector <span className="text-blue-600">Heatmap</span></h2>
            <p className="text-gray-500 mt-2 font-medium">Performance and capital inflow tracking across core sectors.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {sectors.map((sector, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="bg-white border border-gray-100 rounded-2xl p-6 overflow-hidden relative group cursor-default shadow-sm hover:shadow-xl hover:border-blue-100 transition-all"
            >
              <div 
                className="absolute top-0 left-0 w-full h-1 opacity-50 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: sector.color }}
              />
              
              <div className="flex justify-between items-start mb-6">
                 <h3 className="text-2xl font-bold text-gray-900">{sector.name}</h3>
                 <div className={`text-sm font-bold ${sector.perf.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                   {sector.perf}
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <span>AI Status</span>
                    <span className={sector.status === 'Bullish' ? 'text-emerald-600' : sector.status === 'Bearish' ? 'text-rose-600' : 'text-amber-600'}>
                       {sector.status}
                    </span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Money Inflow</span>
                    <span className="text-gray-700">{sector.inflow}</span>
                 </div>
              </div>

              {/* Mini Heatmap Visualization */}
              <div className="grid grid-cols-4 gap-1 mt-6">
                 {[...Array(8)].map((_, i) => (
                   <div 
                      key={i} 
                      className="h-6 rounded-sm opacity-10 group-hover:opacity-40 transition-all"
                      style={{ 
                        backgroundColor: sector.color, 
                        opacity: Math.random() * 0.5 + 0.1 
                      }} 
                   />
                 ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
