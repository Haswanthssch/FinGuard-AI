import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Portfolio } from '@/types';

interface PortfolioState {
  portfolios: Portfolio[];
  selectedPortfolio: Portfolio | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPortfolios: (portfolios: Portfolio[]) => void;
  setSelectedPortfolio: (portfolio: Portfolio | null) => void;
  addPortfolio: (portfolio: Portfolio) => void;
  updatePortfolio: (portfolio: Portfolio) => void;
  deletePortfolio: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  devtools((set) => ({
    portfolios: [],
    selectedPortfolio: null,
    isLoading: false,
    error: null,

    setPortfolios: (portfolios: Portfolio[]) => {
      set({ portfolios });
    },

    setSelectedPortfolio: (portfolio: Portfolio | null) => {
      set({ selectedPortfolio: portfolio });
    },

    addPortfolio: (portfolio: Portfolio) => {
      set((state) => ({
        portfolios: [...state.portfolios, portfolio],
      }));
    },

    updatePortfolio: (portfolio: Portfolio) => {
      set((state) => ({
        portfolios: state.portfolios.map((p) =>
          p.id === portfolio.id ? portfolio : p
        ),
      }));
    },

    deletePortfolio: (id: string) => {
      set((state) => ({
        portfolios: state.portfolios.filter((p) => p.id !== id),
      }));
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    clearError: () => {
      set({ error: null });
    },
  }))
);
