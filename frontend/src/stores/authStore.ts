import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User } from '@/types';
import { apiClient } from '@/api/client';

// Demo credentials for development
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'demo@finguard.ai': {
    password: 'Demo@123456',
    user: {
      id: '1',
      email: 'demo@finguard.ai',
      name: 'Demo Admin',
      roles: ['admin'],
      createdAt: new Date().toISOString(),
    },
  },
  'analyst@finguard.ai': {
    password: 'Analyst@123456',
    user: {
      id: '2',
      email: 'analyst@finguard.ai',
      name: 'Analyst User',
      roles: ['analyst'],
      createdAt: new Date().toISOString(),
    },
  },
  'user@finguard.ai': {
    password: 'User@123456',
    user: {
      id: '3',
      email: 'user@finguard.ai',
      name: 'Regular User',
      roles: ['user'],
      createdAt: new Date().toISOString(),
    },
  },
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null });
          try {
            // Check demo credentials first (for development)
            const demoUser = DEMO_USERS[email];
            if (demoUser && demoUser.password === password) {
              // Generate a mock JWT token for demo
              const mockToken = `demo_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              set({
                user: demoUser.user,
                token: mockToken,
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }

            // Try real backend API
            const response = await apiClient.post('/api/v1/auth/login', {
              email,
              password,
            });
            const data = response.data as { data: { user: User; token: string } };
            const { user, token } = data.data;
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            const err = error as { response?: { data?: { error?: { message?: string } } } };
            const message = err.response?.data?.error?.message || 'Invalid email or password';
            set({
              error: message,
              isLoading: false,
            });
            throw error;
          }
        },

        signup: async (email: string, _password: string, name: string) => {
          set({ isLoading: true, error: null });
          try {
            // For demo, allow signup with any credentials
            // In production, this would call the real backend
            const mockToken = `demo_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const newUser: User = {
              id: `user_${Date.now()}`,
              email,
              name,
              roles: ['user'],
              createdAt: new Date().toISOString(),
            };

            set({
              user: newUser,
              token: mockToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            const err = error as { response?: { data?: { error?: { message?: string } } } };
            const message = err.response?.data?.error?.message || 'Signup failed';
            set({
              error: message,
              isLoading: false,
            });
            throw error;
          }
        },

        logout: () => {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
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
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);
