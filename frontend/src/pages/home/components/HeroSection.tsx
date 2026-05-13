import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, TrendingUp, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-[120px] -z-10" />

      <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Institutional Beta Access</span>
          </div>

          <h1 className="text-7xl lg:text-8xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-8">
            Your Portfolio, <br />
            <span className="text-blue-600 italic">Audited</span> by Intelligence
          </h1>

          <p className="text-xl text-gray-500 max-w-xl leading-relaxed mb-10 font-medium">
            Harness the power of neural-driven risk assessment. Analyze millions of data points to secure your assets against volatility before it happens.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <Link to="/upload">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-2xl flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
              >
                Get Audited
                <ChevronRight size={20} strokeWidth={3} />
              </motion.button>
            </Link>
            <Link to="/dashboard">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white border border-gray-200 text-gray-900 font-bold rounded-2xl flex items-center gap-2 transition-all shadow-sm"
              >
                <Play size={18} fill="currentColor" />
                View Demo
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Visual Element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          {/* Main Card */}
          <div className="relative z-10 bg-white rounded-[32px] border border-gray-100 p-8 shadow-2xl overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
            
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                  <Zap className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold text-sm">Neural Engine v2.4</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Active Scanning</span>
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Latency: 14ms</div>
            </div>

            <div className="space-y-8">
              <div className="relative h-48 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden flex items-center justify-center">
                <div className="text-center">
                   <div className="text-gray-300 font-mono text-[10px] mb-2 uppercase tracking-widest">Portfolio.csv</div>
                   <div className="w-32 h-[1px] bg-gray-200 mx-auto relative overflow-hidden">
                      <motion.div 
                        animate={{ x: [-128, 128] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-blue-500"
                      />
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Risk Factor</div>
                  <div className="text-xl font-bold text-rose-600">Volatile</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Accuracy</div>
                  <div className="text-xl font-bold text-emerald-600">99.8%</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stability</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Systemic Risk</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-rose-500" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-gray-100 rounded-full -z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-gray-100 rounded-full -z-10 opacity-50" />
        </motion.div>
      </div>
    </section>
  );
};
