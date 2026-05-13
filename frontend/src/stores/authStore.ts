import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User } from '@/types';
import { authService, parseApiError } from '@/services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.login({ email, password });
            
            // Map backend user to frontend User type
            const user: User = {
              id: response.user_id,
              email: response.email,
              name: response.full_name,
              roles: ['user'], // Default role
              createdAt: new Date().toISOString(), // Backend doesn't return created_at
            };

            set({
              user,
              token: response.access_token,
              refreshToken: response.refresh_token || null,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            console.log("LOGIN ERROR:", error);
            console.log("FULL ERROR RESPONSE:", JSON.stringify(error.response?.data, null, 2));
            const message = parseApiError(error);
            set({
              error: message,
              isLoading: false,
              isAuthenticated: false,
            });
            throw error;
          }
        },

        signup: async (email: string, password: string, name: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.register({
              email,
              password,
              full_name: name,
            });

            // Map backend user to frontend User type
            const user: User = {
              id: response.user_id,
              email: response.email,
              name: response.full_name,
              roles: ['user'],
              createdAt: new Date().toISOString(),
            };

            set({
              user,
              token: response.access_token,
              refreshToken: response.refresh_token || null,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            console.log("SIGNUP ERROR:", error);
            console.log("FULL ERROR RESPONSE:", JSON.stringify(error.response?.data, null, 2));
            const message = parseApiError(error);
            set({
              error: message,
              isLoading: false,
              isAuthenticated: false,
            });
            throw error;
          }
        },

        logout: async () => {
          try {
            await authService.logout();
          } catch (error) {
            // Ignore logout errors
            console.error('Logout error:', error);
          } finally {
            set({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              error: null,
            });
          }
        },

        setUser: (user: User) => {
          set({ user });
        },

        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);
