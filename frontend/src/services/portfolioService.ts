/**
 * Portfolio Service
 * Handles portfolio and holdings management
 */
import apiClient from '@/api/client';

export interface Portfolio {
  portfolio_id: string;
  user_id: string;
  name: string;
  description?: string;
  risk_profile?: 'LOW' | 'MEDIUM' | 'HIGH';
  total_value: number;
  total_pnl: number;
  total_pnl_pct: number;
  holdings_count: number;
  created_at: string;
  updated_at: string;
}

export interface Holding {
  holding_id: string;
  portfolio_id: string;
  symbol: string;
  exchange: 'NSE' | 'BSE';
  company_name?: string;
  sector?: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  current_price?: number;
  current_value?: number;
  pnl?: number;
  pnl_pct?: number;
  last_updated?: string;
}

export interface PortfolioWithHoldings extends Portfolio {
  holdings: Holding[];
}

export interface CreatePortfolioRequest {
  name: string;
  description?: string;
  risk_profile?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface UploadCSVResponse {
  message: string;
  portfolio_id: string;
  holdings_count: number;
}

export interface RiskAssessment {
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  top_factors: Array<{
    feature: string;
    direction: string;
    impact: string;
  }>;
  anomalies: Array<{
    symbol: string;
    severity: string;
    reasons: string[];
  }>;
  recommendations: string[];
  ml_insights?: {
    risk_category: string;
    archetype: string;
    stress_tests: Record<string, number>;
  };
}

export const portfolioService = {
  /**
   * Get all portfolios for current user
   */
  async getPortfolios(): Promise<Portfolio[]> {
    const response = await apiClient.get<Portfolio[]>('/api/v1/portfolio');
    return response.data;
  },

  /**
   * Get single portfolio with holdings
   */
  async getPortfolio(portfolioId: string): Promise<PortfolioWithHoldings> {
    const response = await apiClient.get<PortfolioWithHoldings>(`/api/v1/portfolio/${portfolioId}`);
    return response.data;
  },

  /**
   * Create new portfolio
   */
  async createPortfolio(data: CreatePortfolioRequest): Promise<Portfolio> {
    const response = await apiClient.post<Portfolio>('/api/v1/portfolio', data);
    return response.data;
  },

  /**
   * Update portfolio
   */
  async updatePortfolio(portfolioId: string, data: Partial<CreatePortfolioRequest>): Promise<Portfolio> {
    const response = await apiClient.put<Portfolio>(`/api/v1/portfolio/${portfolioId}`, data);
    return response.data;
  },

  /**
   * Delete portfolio
   */
  async deletePortfolio(portfolioId: string): Promise<void> {
    await apiClient.delete(`/api/v1/portfolio/${portfolioId}`);
  },

  /**
   * Upload CSV file to create/update portfolio
   */
  async uploadCSV(file: File, portfolioName?: string): Promise<UploadCSVResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (portfolioName) {
      formData.append('portfolio_name', portfolioName);
    }

    console.log('--- UPLOAD REQUEST PREFLIGHT ---');
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    
    const response = await apiClient.post<UploadCSVResponse>('/api/v1/portfolio/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get portfolio metrics
   */
  async getMetrics(portfolioId: string): Promise<{
    total_value: number;
    total_pnl: number;
    total_pnl_pct: number;
    sector_allocation: Record<string, number>;
    top_gainers: Holding[];
    top_losers: Holding[];
  }> {
    const response = await apiClient.get(`/api/v1/portfolio/${portfolioId}/metrics`);
    return response.data;
  },

  /**
   * Get AI risk assessment for a portfolio
   */
  async getRiskAssessment(portfolioId: string): Promise<RiskAssessment> {
    const response = await apiClient.get<RiskAssessment>(`/api/v1/portfolio/${portfolioId}/risk-assessment`);
    return response.data;
  },
};

export default portfolioService;
