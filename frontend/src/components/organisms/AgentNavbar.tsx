import { useAgentStore, type AgentType } from '@/stores/agentStore';
import { cn } from '@/lib/cn';
import { motion } from 'framer-motion';

const agentAccent: Record<AgentType, { active: string; dot: string; glow: string }> = {
  portfolio: {
    active: 'bg-blue-600 text-white shadow-lg shadow-blue-600/15',
    dot: 'bg-blue-200',
    glow: 'bg-blue-400/10',
  },
  risk: {
    active: 'bg-amber-500 text-white shadow-lg shadow-amber-500/15',
    dot: 'bg-amber-100',
    glow: 'bg-amber-400/10',
  },
  compliance: {
    active: 'bg-slate-900 text-white shadow-lg shadow-slate-900/15',
    dot: 'bg-slate-200',
    glow: 'bg-slate-400/10',
  },
  performance: {
    active: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/15',
    dot: 'bg-emerald-100',
    glow: 'bg-emerald-400/10',
  },
};

export function AgentNavbar() {
  const activeAgent = useAgentStore((state) => state.activeAgent);
  const agents = useAgentStore((state) => state.agents);
  const setActiveAgent = useAgentStore((state) => state.setActiveAgent);

  const agentList: AgentType[] = ['portfolio', 'risk', 'compliance', 'performance'];

  return (
    <div className="border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-10 px-6 py-3 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-3 min-w-max">
        <div className="pr-4 border-r border-gray-100 mr-2">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            Agent Selection
          </h2>
        </div>
        {agentList.map((agentId) => {
          const agent = agents[agentId];
          const isActive = activeAgent === agentId;
          const accent = agentAccent[agentId];

          return (
            <motion.button
              key={agentId}
              onClick={() => setActiveAgent(isActive ? null : agentId)}
              className={cn(
                'group relative flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all duration-300',
                isActive
                  ? cn(accent.active, 'border-transparent')
                  : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-100 shadow-sm hover:shadow-card'
              )}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              <span className="text-xl filter drop-shadow-sm">{agent.emoji}</span>
              <div className="flex flex-col items-start">
                <span className={cn(
                  'text-sm font-bold whitespace-nowrap leading-none mb-1',
                  isActive ? 'text-white' : 'text-gray-900'
                )}>
                  {agent.name.split(' ')[0]}
                </span>
                <div className="flex items-center gap-1.5">
                  <motion.div
                    animate={agent.status === 'analyzing' ? { scale: [1, 1.4, 1], opacity: [1, 0.4, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      agent.status === 'idle' && (isActive ? accent.dot : 'bg-gray-300'),
                      agent.status === 'analyzing' && 'bg-amber-300',
                      agent.status === 'active' && 'bg-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                    )}
                  />
                  <span className={cn(
                    'text-[9px] uppercase tracking-wider font-black',
                    isActive ? 'text-white/75' : 'text-gray-500'
                  )}>
                    {agent.status}
                  </span>
                </div>
              </div>

              {isActive && (
                <motion.div
                  layoutId="activeAgentGlow"
                  className={cn('absolute inset-0 rounded-xl -z-10 blur-xl', accent.glow)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
