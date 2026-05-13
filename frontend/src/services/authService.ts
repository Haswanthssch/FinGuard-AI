/**
 * Authentication Service
 * Handles user authentication with the backend API
 */
import apiClient from '@/api/client';

export const parseApiError = (error: any): string => {
  if (typeof error === 'string') return error;

  if (Array.isArray(error)) {
    return error.map((e) => e.msg).join(', ');
  }

  if (error?.response?.data?.detail) {
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail.map((e: any) => {
        const field = e.loc?.[1] ? `${e.loc[1]}: ` : '';
        return `${field}${e.msg}`;
      }).join(', ');
    }
    return typeof error.response.data.detail === 'string' 
      ? error.response.data.detail 
      : JSON.stringify(error.response.data.detail);
  }

  return error?.message || 'Something went wrong';
};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  user_id: string;
  email: string;
  full_name: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  onboarding_complete?: boolean;
  refresh_token?: string;
}

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log("LOGIN PAYLOAD:", credentials);

    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', {
      email: credentials.email,
      password: credentials.password
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', data);
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await apiClient.post('/api/v1/auth/logout');
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<AuthResponse['user']> {
    const response = await apiClient.get<AuthResponse['user']>('/api/v1/auth/me');
    return response.data;
  },
};

export default authService;
