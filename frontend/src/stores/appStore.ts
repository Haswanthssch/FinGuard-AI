import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface AppState {
  // UI State
  notifications: Notification[];

  // Actions
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>()(
  devtools((set) => ({
    notifications: [],

    addNotification: (notification: Omit<Notification, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9);
      set((state) => ({
        notifications: [...state.notifications, { ...notification, id }],
      }));

      // Auto-remove after duration
      if (notification.duration) {
        setTimeout(() => {
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }));
        }, notification.duration);
      }
    },

    removeNotification: (id: string) => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    },

    clearNotifications: () => {
      set({ notifications: [] });
    },
  }))
);
