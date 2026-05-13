import { useAgentStore } from '@/stores/agentStore';
import { motion } from 'framer-motion';
import { Activity, Clock } from 'lucide-react';

export function MissionControlHeader() {
  const activeAgent = useAgentStore((state) => state.activeAgent);
  const agents = useAgentStore((state) => state.agents);
  const agent = activeAgent ? agents[activeAgent] : null;

  return (
    <div className="border-b border-gray-100 bg-white px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/15"
          >
            <Activity className="text-white" size={22} />
          </motion.div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
              AI Financial Intelligence Hub
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.18em]">
              Portfolio intelligence command layer
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
          <Clock className="w-3 h-3" />
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {agent && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-gray-600"
        >
          <span className="text-lg">{agent.emoji}</span>
          <span>
            <span className="font-semibold text-gray-900">{agent.name}</span> - {agent.description}
          </span>
        </motion.div>
      )}

      {!agent && (
        <div className="text-sm text-gray-500">
          Select an agent from the top navbar to begin analysis
        </div>
      )}
    </div>
  );
}
