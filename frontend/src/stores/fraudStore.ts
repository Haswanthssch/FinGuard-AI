import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { FraudAlert } from '@/types';

interface FraudState {
  alerts: FraudAlert[];
  selectedAlert: FraudAlert | null;
  isLoading: boolean;
  error: string | null;
  filter: 'all' | 'open' | 'investigating' | 'resolved' | 'false_positive';

  // Actions
  setAlerts: (alerts: FraudAlert[]) => void;
  setSelectedAlert: (alert: FraudAlert | null) => void;
  addAlert: (alert: FraudAlert) => void;
  updateAlert: (alert: FraudAlert) => void;
  deleteAlert: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: FraudState['filter']) => void;
  clearError: () => void;
}

export const useFraudStore = create<FraudState>()(
  devtools((set) => ({
    alerts: [],
    selectedAlert: null,
    isLoading: false,
    error: null,
    filter: 'all',

    setAlerts: (alerts: FraudAlert[]) => {
      set({ alerts });
    },

    setSelectedAlert: (alert: FraudAlert | null) => {
      set({ selectedAlert: alert });
    },

    addAlert: (alert: FraudAlert) => {
      set((state) => ({
        alerts: [alert, ...state.alerts],
      }));
    },

    updateAlert: (alert: FraudAlert) => {
      set((state) => ({
        alerts: state.alerts.map((a) =>
          a.id === alert.id ? alert : a
        ),
      }));
    },

    deleteAlert: (id: string) => {
      set((state) => ({
        alerts: state.alerts.filter((a) => a.id !== id),
      }));
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    setFilter: (filter: FraudState['filter']) => {
      set({ filter });
    },

    clearError: () => {
      set({ error: null });
    },
  }))
);
