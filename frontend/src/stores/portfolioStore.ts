import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { portfolioService, type Portfolio as ApiPortfolio, type PortfolioWithHoldings, type CreatePortfolioRequest, type Holding, type RiskAssessment } from '@/services/portfolioService';

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  holdingsCount: number;
  riskProfile: string;
  createdAt: string;
  updatedAt: string;
  holdings?: Holding[];
}

interface PortfolioState {
  portfolios: Portfolio[];
  selectedPortfolio: Portfolio | null;
  riskAssessment: RiskAssessment | null;
  isLoading: boolean;
  isLoadingRisk: boolean;
  error: string | null;

  // Actions
  fetchPortfolios: () => Promise<void>;
  fetchPortfolio: (portfolioId: string) => Promise<void>;
  fetchRiskAssessment: (portfolioId: string) => Promise<void>;
  createPortfolio: (data: CreatePortfolioRequest) => Promise<void>;
  updatePortfolio: (portfolioId: string, data: Partial<CreatePortfolioRequest>) => Promise<void>;
  deletePortfolio: (portfolioId: string) => Promise<void>;
  uploadCSV: (file: File, portfolioName?: string) => Promise<void>;
  setSelectedPortfolio: (portfolio: Portfolio | null) => void;
  clearError: () => void;
}

// Helper to convert API portfolio to UI portfolio
// Handles two response shapes:
//   1. List endpoint: flat fields (total_value, total_pnl, total_pnl_pct, holdings_count)
//   2. Detail endpoint: nested (metrics.total_value, metrics.total_pnl, etc. + holdings[])
const convertApiPortfolio = (apiPortfolio: any): Portfolio => {
  // Detail endpoint wraps metrics in a nested object
  const metrics = apiPortfolio.metrics || {};
  
  const totalValue = apiPortfolio.total_value ?? metrics.total_value ?? 0;
  const totalPnL = apiPortfolio.total_pnl ?? metrics.total_pnl ?? 0;
  const totalPnLPct = apiPortfolio.total_pnl_pct ?? metrics.total_pnl_pct ?? 0;
  const holdingsCount = apiPortfolio.holdings_count ?? metrics.holding_count ?? (apiPortfolio.holdings?.length ?? 0);

  return {
    id: apiPortfolio.portfolio_id,
    name: apiPortfolio.name,
    description: apiPortfolio.description || '',
    totalValue,
    totalPnL,
    totalPnLPercent: totalPnLPct,
    holdingsCount,
    riskProfile: apiPortfolio.risk_profile || 'MEDIUM',
    createdAt: apiPortfolio.created_at,
    updatedAt: apiPortfolio.updated_at,
    holdings: apiPortfolio.holdings || undefined,
  };
};

export const usePortfolioStore = create<PortfolioState>()(
  devtools((set, get) => ({
    portfolios: [],
    selectedPortfolio: null,
    riskAssessment: null,
    isLoading: false,
    isLoadingRisk: false,
    error: null,

    fetchPortfolios: async () => {
      set({ isLoading: true, error: null });
      try {
        const apiPortfolios = await portfolioService.getPortfolios();
        const allPortfolios = apiPortfolios.map(convertApiPortfolio);
        
        // Only keep the latest upload
        const latestPortfolios = allPortfolios.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 1);
        
        set({ portfolios: latestPortfolios, isLoading: false });
      } catch (error: any) {
        set({ 
          error: error.response?.data?.detail || 'Failed to fetch portfolios',
          isLoading: false 
        });
      }
    },

    fetchPortfolio: async (portfolioId: string) => {
      set({ isLoading: true, error: null });
      try {
        const apiPortfolio = await portfolioService.getPortfolio(portfolioId);
        const portfolio = convertApiPortfolio(apiPortfolio);
        set({ selectedPortfolio: portfolio, isLoading: false });
      } catch (error: any) {
        set({ 
          error: error.response?.data?.detail || 'Failed to fetch portfolio',
          isLoading: false 
        });
      }
    },

    fetchRiskAssessment: async (portfolioId: string) => {
      set({ isLoadingRisk: true });
      try {
        const riskAssessment = await portfolioService.getRiskAssessment(portfolioId);
        set({ riskAssessment, isLoadingRisk: false });
      } catch (error: any) {
        console.error('Failed to fetch risk assessment:', error);
        set({ isLoadingRisk: false });
      }
    },

    createPortfolio: async (data: CreatePortfolioRequest) => {
      set({ isLoading: true, error: null });
      try {
        const apiPortfolio = await portfolioService.createPortfolio(data);
        const portfolio = convertApiPortfolio(apiPortfolio);
        set(() => ({
          portfolios: [portfolio],
          selectedPortfolio: portfolio,
          isLoading: false,
        }));
      } catch (error: any) {
        set({ 
          error: error.response?.data?.detail || 'Failed to create portfolio',
          isLoading: false 
        });
        throw error;
      }
    },

    updatePortfolio: async (portfolioId: string, data: Partial<CreatePortfolioRequest>) => {
      set({ isLoading: true, error: null });
      try {
        const apiPortfolio = await portfolioService.updatePortfolio(portfolioId, data);
        const portfolio = convertApiPortfolio(apiPortfolio);
        set((state) => ({
          portfolios: state.portfolios.map((p) =>
            p.id === portfolioId ? portfolio : p
          ),
          selectedPortfolio: state.selectedPortfolio?.id === portfolioId ? portfolio : state.selectedPortfolio,
          isLoading: false,
        }));
      } catch (error: any) {
        set({ 
          error: error.response?.data?.detail || 'Failed to update portfolio',
          isLoading: false 
        });
        throw error;
      }
    },

    deletePortfolio: async (portfolioId: string) => {
      set({ isLoading: true, error: null });
      try {
        await portfolioService.deletePortfolio(portfolioId);
        set((state) => ({
          portfolios: state.portfolios.filter((p) => p.id !== portfolioId),
          selectedPortfolio: state.selectedPortfolio?.id === portfolioId ? null : state.selectedPortfolio,
          isLoading: false,
        }));
      } catch (error: any) {
        set({ 
          error: error.response?.data?.detail || 'Failed to delete portfolio',
          isLoading: false 
        });
        throw error;
      }
    },

    uploadCSV: async (file: File, portfolioName?: string) => {
      set({ isLoading: true, error: null, selectedPortfolio: null });
      try {
        await portfolioService.uploadCSV(file, portfolioName);
        // Refresh portfolios after upload - fetchPortfolios now handles keeping only the latest
        await get().fetchPortfolios();
      } catch (error: any) {
        set({ 
          error: error.response?.data?.detail || 'Failed to upload CSV',
          isLoading: false 
        });
        throw error;
      }
    },

    setSelectedPortfolio: (portfolio: Portfolio | null) => {
      set({ selectedPortfolio: portfolio });
    },

    clearError: () => {
      set({ error: null });
    },
  }))
);
