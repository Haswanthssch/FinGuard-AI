import axios from 'axios';
import { AgentType } from '@/stores/agentStore';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1`;

export interface AgentAnalysisRequest {
  agent: string;
  query: string;
  portfolio_data?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export interface AgentAnalysisResponse {
  agent: string;
  analysis: string;
  thinking?: string;
  model_used: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface StressTestResponse {
  agent: string;
  stress_test_results: Record<string, { portfolio_loss_percent: number; estimated_loss_amount: number }>;
  max_loss_scenario: string;
}

export interface PerformanceMetricsResponse {
  agent: string;
  metrics: Record<string, unknown>;
  outperforming_benchmark: boolean;
}



class AgentAPIClient {
  private client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async analyzeWithAgent(
    request: AgentAnalysisRequest
  ): Promise<AgentAnalysisResponse> {
    const response = await this.client.post<AgentAnalysisResponse>(
      '/agents/analyze',
      request
    );
    return response.data;
  }

  async runStressTest(
    portfolioData: Record<string, unknown>
  ): Promise<StressTestResponse> {
    const response = await this.client.post<StressTestResponse>(
      '/agents/stress-test',
      {
        portfolio_data: portfolioData,
      }
    );
    return response.data;
  }



  async calculatePerformanceMetrics(
    portfolioData: Record<string, unknown>
  ): Promise<PerformanceMetricsResponse> {
    const response = await this.client.post<PerformanceMetricsResponse>(
      '/agents/performance-metrics',
      {
        portfolio_data: portfolioData,
      }
    );
    return response.data;
  }

  async getAvailableAgents(): Promise<{
    agents: Array<{
      id: string;
      name: string;
      emoji: string;
      description: string;
      capabilities: string[];
    }>;
    total: number;
  }> {
    const response = await this.client.get('/agents/available');
    return response.data;
  }
}

export const agentAPIClient = new AgentAPIClient();
