import { MissionControlHeader, AgentNavbar, ActiveAgentWorkspace, AgentChat } from '@/components/organisms';
import { useAgentStore } from '@/stores/agentStore';

export function ReportsPage() {
  const activeAgent = useAgentStore((state) => state.activeAgent);

  return (
    <div className="flex flex-col bg-[#FAFAFA] overflow-hidden select-none" style={{ height: 'calc(100vh - 105px)' }}>
      {/* Mission Control Header */}
      <MissionControlHeader />

      {/* Agent Selection Navbar */}
      <AgentNavbar />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Center: Active Agent Workspace */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#FAFAFA]">
          <ActiveAgentWorkspace />
        </div>

        {/* Right: Agent Sidebar */}
        <div className="w-[340px] border-l border-gray-100 bg-white flex flex-col overflow-hidden shadow-[-10px_0_24px_rgba(17,24,39,0.03)]">
          {activeAgent ? (
            <>
              {/* Sidebar Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-white">
                <span className="text-xl">
                  {activeAgent === 'portfolio' && '🧠'}
                  {activeAgent === 'risk' && '⚠️'}
                  {activeAgent === 'compliance' && '🏛'}
                  {activeAgent === 'performance' && '📈'}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 capitalize">
                    {activeAgent} Intelligence
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                    Live Chat Session
                  </span>
                </div>
              </div>
              
              {/* Chat Session */}
              <div className="flex-1 overflow-hidden">
                <AgentChat agentId={activeAgent} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-400 text-sm bg-white">
              Select an agent to start a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
