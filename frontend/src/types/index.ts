// User types
export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  createdAt: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Portfolio types
export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  holdingsCount: number;
  riskProfile: string;
  createdAt: string;
  updatedAt: string;
  holdings?: Holding[];
}

export interface Holding {
  id: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  allocation: number;
}



// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
