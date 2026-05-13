import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Target, Shield, Zap, Info } from 'lucide-react';

export const InvestorDNA: React.FC = () => {
  return (
    <section className="py-24 bg-[#F8FAFC] border-t border-gray-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[120px] -z-10" />

      <div className="max-w-[1600px] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
            <Fingerprint className="text-emerald-600" size={16} />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Personalized AI Engine</span>
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">Investor <span className="text-emerald-600">DNA</span> Engine</h2>
          <p className="text-gray-500 text-lg leading-relaxed font-medium">
            Professional AI-assisted investment profiling. Our engine analyzes your risk appetite, goals, and behavior to build your institutional-grade investor profile.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Interactive Form Mockup */}
          <div className="bg-white border border-gray-100 rounded-[40px] p-10 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 p-6">
                <div className="p-3 rounded-2xl bg-gray-50 text-gray-400">
                   <Target size={24} />
                </div>
             </div>

             <h3 className="text-2xl font-bold text-gray-900 mb-8">Initialize DNA Sequence</h3>
             
             <div className="space-y-8">
                <div>
                   <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      <span>Risk Tolerance</span>
                      <span className="text-emerald-600">Moderate-High</span>
                   </div>
                   <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '70%' }}
                        transition={{ duration: 1.5 }}
                        className="h-full bg-emerald-500" 
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Horizon</div>
                      <div className="text-gray-900 font-bold">7-10 Years</div>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Loss Limit</div>
                      <div className="text-gray-900 font-bold">15% Max</div>
                   </div>
                </div>

                <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                   Analyze My DNA
                   <Zap size={18} fill="currentColor" />
                </button>
             </div>
          </div>

          {/* Right Side: Features */}
          <div className="space-y-8">
             {[
               {
                 title: "Risk Profile Archetype",
                 desc: "Beyond simple 'aggressive' or 'conservative'. We map 14 dimensions of risk behavior.",
                 icon: Shield
               },
               {
                 title: "Institutional Allocation",
                 desc: "Get suggested asset splits based on professional pension fund management models.",
                 icon: Target
               },
               {
                 title: "Behavioral Guardrails",
                 desc: "AI identifies potential emotional biases in your decision-making patterns.",
                 icon: Info
               }
             ].map((feature, i) => (
               <div key={i} className="flex gap-6 group">
                 <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-all shadow-sm">
                    <feature.icon className="text-gray-400 group-hover:text-emerald-600 transition-all" size={24} />
                 </div>
                 <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">{feature.desc}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </section>
  );
};
