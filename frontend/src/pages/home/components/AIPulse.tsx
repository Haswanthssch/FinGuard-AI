import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Zap, ShieldCheck, TrendingUp, AlertTriangle, Activity } from 'lucide-react';

const insights = [
  {
    title: "Banking sector showing strong momentum",
    desc: "Neural analysis detects significant institutional inflow in major private banks. Momentum score: 8.4/10.",
    tag: "Bullish",
    icon: TrendingUp
  },
  {
    title: "Small-cap volatility increasing",
    desc: "Predictive models suggest a 15% increase in volatility for Nifty Smallcap 100 over the next 4 trading sessions.",
    tag: "Warning",
    icon: AlertTriangle
  },
  {
    title: "Gold demand rising amid uncertainty",
    desc: "Global macro conditions are driving a safe-haven rotation. Technical breakout confirmed at $2,340.",
    tag: "Bullish",
    icon: ShieldCheck
  },
  {
    title: "IT sector earnings anticipation",
    desc: "AI sentiment models show mixed signals ahead of major IT earnings. Neutral stance recommended.",
    tag: "Neutral",
    icon: Activity
  }
];



export const AIPulse: React.FC = () => {
  return (
    <section className="py-24 bg-[#F8FAFC] border-t border-gray-100">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Heading */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                <Brain className="text-emerald-600" size={20} />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Neural Intelligence</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-6">AI Market <span className="text-emerald-600">Pulse</span></h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 font-medium">
              Continuous algorithmic observation of market telemetry, sentiment, and technical structures.
            </p>
            <div className="p-6 bg-emerald-50 rounded-[24px] border border-emerald-100 shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                 <Sparkles className="text-emerald-600" size={20} />
                 <span className="text-sm font-bold text-gray-900">Live AI Analyst</span>
               </div>
               <p className="text-sm text-gray-600 leading-relaxed italic font-medium">
                 "Our models are currently detecting a rotation from mid-cap growth stocks to large-cap value, specifically within the FMCG and Pharma sectors."
               </p>
            </div>
          </div>

          {/* Right Column: Insights List */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className="p-8 bg-white border border-gray-100 rounded-[32px] flex flex-col justify-between group cursor-default shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                        <Icon size={24} />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        item.tag === 'Bullish' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        item.tag === 'Warning' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        'bg-gray-50 text-gray-500 border border-gray-100'
                      }`}>
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
