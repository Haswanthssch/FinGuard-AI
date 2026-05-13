import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type AgentType = 'portfolio' | 'risk' | 'compliance' | 'performance';

export interface Agent {
  id: AgentType;
  name: string;
  emoji: string;
  role: string;
  description: string;
  status: 'idle' | 'analyzing' | 'active';
  lastUpdate: Date;
  capabilities: string[];
  currentThinking?: string;
  color: string;
}

export interface ConversationMessage {
  id: string;
  agentId: AgentType;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  thinking?: string;
  llm_source?: string;
}

export interface IntelligenceFeedItem {
  id: string;
  type: 'insight' | 'alert' | 'observation' | 'recommendation' | 'warning';
  agentId: AgentType;
  title: string;
  content: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  actionable?: boolean;
}

export interface PortfolioContext {
  uploadedData?: any;
  totalValue?: number;
  holdingsCount?: number;
  lastAnalyzed?: Date;
}

interface AgentState {
  // Active agent
  activeAgent: AgentType | null;
  setActiveAgent: (agent: AgentType | null) => void;

  // Agents
  agents: Record<AgentType, Agent>;
  updateAgentStatus: (agentId: AgentType, status: Agent['status']) => void;
  updateAgentThinking: (agentId: AgentType, thinking: string | undefined) => void;

  // Conversations
  conversations: Record<AgentType, ConversationMessage[]>;
  addMessage: (agentId: AgentType, message: ConversationMessage) => void;
  clearConversation: (agentId: AgentType) => void;

  // Intelligence Feed
  feed: IntelligenceFeedItem[];
  addFeedItem: (item: IntelligenceFeedItem) => void;
  removeFeedItem: (id: string) => void;
  clearFeed: () => void;

  // Portfolio Context
  portfolioContext: PortfolioContext;
  setPortfolioContext: (context: PortfolioContext) => void;
}

const INITIAL_AGENTS: Record<AgentType, Agent> = {
  portfolio: {
    id: 'portfolio',
    name: 'Portfolio Intelligence Agent',
    emoji: '🧠',
    role: 'AI Wealth Strategist',
    description: 'Monitors allocation, diversification, and sector health',
    status: 'idle',
    lastUpdate: new Date(),
    color: '#2563EB',
    capabilities: [
      'Portfolio Analyzer',
      'Benchmark Comparator',
      'Rebalancing Engine',
      'AI Recommendations',
    ],
  },
  risk: {
    id: 'risk',
    name: 'Risk & Exposure Agent',
    emoji: '⚠️',
    role: 'Quantitative Risk Analyst',
    description: 'Monitors volatility, VaR, stress testing, and downside exposure',
    status: 'idle',
    lastUpdate: new Date(),
    color: '#F59E0B',
    capabilities: [
      'VaR Calculator',
      'Volatility Analyzer',
      'Stress Tester',
      'Drawdown Analyzer',
      'Liquidity Risk Scanner',
    ],
  },
  compliance: {
    id: 'compliance',
    name: 'Compliance & Regulatory Agent',
    emoji: '🏛️',
    role: 'Regulatory Compliance Expert',
    description: 'Provides SEBI, RBI, AML/KYC compliance guidance',
    status: 'idle',
    lastUpdate: new Date(),
    color: '#7C3AED',
    capabilities: [
      'Regulation Search',
      'Compliance Checker',
      'KYC/AML Guide',
      'Regulatory Calendar',
      'RAG Retriever',
    ],
  },
  performance: {
    id: 'performance',
    name: 'Performance Analytics Agent',
    emoji: '📈',
    role: 'Quantitative Performance Analyst',
    description: 'Calculates CAGR, XIRR, alpha/beta, and performance metrics',
    status: 'idle',
    lastUpdate: new Date(),
    color: '#10B981',
    capabilities: [
      'Returns Calculator',
      'Risk-Adjusted Metrics',
      'Rolling Returns Analyzer',
      'Attribution Analyzer',
      'Performance Forecaster',
      'Benchmark Dashboard',
    ],
  },
};

export const useAgentStore = create<AgentState>()(
  devtools((set, get) => ({
    activeAgent: null,
    setActiveAgent: (agent) => set({ activeAgent: agent }),

    agents: INITIAL_AGENTS,
    updateAgentStatus: (agentId, status) =>
      set((state) => ({
        agents: {
          ...state.agents,
          [agentId]: {
            ...state.agents[agentId],
            status,
            lastUpdate: new Date(),
          },
        },
      })),

    updateAgentThinking: (agentId, thinking) =>
      set((state) => ({
        agents: {
          ...state.agents,
          [agentId]: {
            ...state.agents[agentId],
            currentThinking: thinking,
          },
        },
      })),

    conversations: {
      portfolio: [],
      risk: [],
      compliance: [],
      performance: [],
    },

    addMessage: (agentId, message) =>
      set((state) => ({
        conversations: {
          ...state.conversations,
          [agentId]: [...state.conversations[agentId], message],
        },
      })),

    clearConversation: (agentId) =>
      set((state) => ({
        conversations: {
          ...state.conversations,
          [agentId]: [],
        },
      })),

    feed: [],
    addFeedItem: (item) =>
      set((state) => ({
        feed: [item, ...state.feed].slice(0, 50), // Keep last 50 items
      })),

    removeFeedItem: (id) =>
      set((state) => ({
        feed: state.feed.filter((item) => item.id !== id),
      })),

    clearFeed: () => set({ feed: [] }),

    portfolioContext: {},
    setPortfolioContext: (context) => set({ portfolioContext: context }),
  }))
);
