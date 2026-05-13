import { useAgentStore } from '@/stores/agentStore';
import { PortfolioAgentWorkspace } from './agent-workspaces/PortfolioAgentWorkspace';
import { RiskAgentWorkspace } from './agent-workspaces/RiskAgentWorkspace';
import { ComplianceAgentWorkspace } from './agent-workspaces/ComplianceAgentWorkspace';
import { PerformanceAgentWorkspace } from './agent-workspaces/PerformanceAgentWorkspace';
import { motion } from 'framer-motion';

export function ActiveAgentWorkspace() {
  const activeAgent = useAgentStore((state) => state.activeAgent);

  if (!activeAgent) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#FAFAFA] text-center p-12">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-card flex items-center justify-center text-xl font-black text-blue-600 mb-6"
        >
          AI
        </motion.div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-3">
          FinGuard AI Hub
        </h2>
        <p className="text-gray-500 max-w-md mb-8 font-medium leading-relaxed">
          Select an agent from the top navbar to begin analysis. Each agent provides specialized financial intelligence and insights tailored to your portfolio.
        </p>
        <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
          <p><span className="font-semibold text-blue-600">Portfolio Intelligence</span> - Allocation and diversification</p>
          <p><span className="font-semibold text-amber-600">Risk & Exposure</span> - Volatility and stress testing</p>
          <p><span className="font-semibold text-slate-900">Compliance</span> - Regulatory guidance</p>
          <p><span className="font-semibold text-emerald-600">Performance</span> - Quantitative analytics</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={activeAgent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      {activeAgent === 'portfolio' && <PortfolioAgentWorkspace />}
      {activeAgent === 'risk' && <RiskAgentWorkspace />}
      {activeAgent === 'compliance' && <ComplianceAgentWorkspace />}
      {activeAgent === 'performance' && <PerformanceAgentWorkspace />}
    </motion.div>
  );
}
