import React, { useEffect } from 'react';
import { HeroSection } from './components/HeroSection';
import { MarketIntelligence } from './components/MarketIntelligence';
import { MarketMovers } from './components/MarketMovers';
import { GlobalAssets } from './components/GlobalAssets';
import { AIPulse } from './components/AIPulse';
import { SectorHeatmap } from './components/SectorHeatmap';
import { InvestorDNA } from './components/InvestorDNA';
import { Activity, Globe, Share2, Shield, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#FAFAFA] text-gray-900">
      {/* Hero Section */}
      <HeroSection />

      {/* AI Market Intelligence Feed */}
      <MarketIntelligence />

      {/* Top Market Movers */}
      <MarketMovers />

      {/* Global Asset Monitor */}
      <GlobalAssets />

      {/* AI Market Pulse */}
      <AIPulse />

      {/* Sector Heatmap */}
      <SectorHeatmap />

      {/* Investor DNA Engine */}
      <InvestorDNA />

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center gap-2.5 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Activity className="text-white" size={24} />
                </div>
                <span className="text-2xl font-bold text-gray-900 tracking-tight">FinGuard AI</span>
              </Link>
              <p className="text-gray-500 leading-relaxed mb-8 font-medium">
                Empowering the world's elite investors with artificial intelligence that never sleeps. Professional-grade financial intelligence for everyone.
              </p>
              <div className="flex items-center gap-4">
                {[Globe, Share2, Shield, Mail].map((Icon, i) => (
                  <button key={i} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all shadow-sm">
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-gray-900 font-bold mb-8 uppercase text-xs tracking-widest">Platform</h4>
              <ul className="space-y-4 text-gray-500 text-sm font-semibold">
                <li><Link to="/dashboard" className="hover:text-blue-600 transition-colors">Live Markets</Link></li>
                <li><Link to="/portfolio" className="hover:text-blue-600 transition-colors">Portfolio Analysis</Link></li>
                <li><Link to="/aihub" className="hover:text-blue-600 transition-colors">AI Intelligence</Link></li>
                <li><Link to="/regulatory" className="hover:text-blue-600 transition-colors">Regulatory AI</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-gray-900 font-bold mb-8 uppercase text-xs tracking-widest">Company</h4>
              <ul className="space-y-4 text-gray-500 text-sm font-semibold">
                <li><Link to="#" className="hover:text-blue-600 transition-colors">About Us</Link></li>
                <li><Link to="#" className="hover:text-blue-600 transition-colors">Careers</Link></li>
                <li><Link to="#" className="hover:text-blue-600 transition-colors">Institutional</Link></li>
                <li><Link to="#" className="hover:text-blue-600 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-gray-900 font-bold mb-8 uppercase text-xs tracking-widest">Compliance</h4>
              <ul className="space-y-4 text-gray-500 text-sm font-semibold">
                <li><Link to="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                <li><Link to="#" className="hover:text-blue-600 transition-colors">SEBI Regulatory</Link></li>
                <li><Link to="#" className="hover:text-blue-600 transition-colors">AML Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            <p>© 2026 FinGuard AI. All rights reserved.</p>
            <div className="flex items-center gap-8">
              <span>System Status: <span className="text-emerald-500">Operational</span></span>
              <span>v4.2.0-stable</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
