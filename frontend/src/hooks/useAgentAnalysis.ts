import { useState, useCallback } from 'react';
import { useAgentStore } from '@/stores/agentStore';
import { agentAPIClient } from '@/api/agentClient';
import { type AgentType } from '@/stores/agentStore';

export function useAgentAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAgentStatus = useAgentStore((state) => state.updateAgentStatus);
  const updateAgentThinking = useAgentStore((state) => state.updateAgentThinking);
  const addFeedItem = useAgentStore((state) => state.addFeedItem);
  const addMessage = useAgentStore((state) => state.addMessage);

  const analyzeWithAgent = useCallback(
    async (agentId: AgentType, query: string, portfolioData?: Record<string, unknown>) => {
      setIsLoading(true);
      setError(null);

      try {
        updateAgentStatus(agentId, 'analyzing');
        updateAgentThinking(agentId, 'Initializing analysis...');

        const response = await agentAPIClient.analyzeWithAgent({
          agent: agentId,
          query,
          portfolio_data: portfolioData,
        });

        // Add agent thinking to store
        updateAgentThinking(agentId, response.thinking);

        // Add response message
        addMessage(agentId, {
          id: Date.now().toString(),
          agentId,
          role: 'agent',
          content: response.analysis,
          timestamp: new Date(),
          thinking: response.thinking,
        });

        // Add to feed
        addFeedItem({
          id: Date.now().toString(),
          type: 'insight',
          agentId,
          title: `Analysis from ${agentId}`,
          content: response.analysis.substring(0, 150),
          timestamp: new Date(),
          severity: 'low',
          actionable: true,
        });

        updateAgentStatus(agentId, 'idle');
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        updateAgentStatus(agentId, 'idle');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateAgentStatus, updateAgentThinking, addFeedItem, addMessage]
  );

  const runStressTest = useCallback(
    async (portfolioData: Record<string, unknown>) => {
      setIsLoading(true);
      setError(null);

      try {
        const agentId: AgentType = 'risk';
        updateAgentStatus(agentId, 'analyzing');

        const response = await agentAPIClient.runStressTest(portfolioData);

        // Add alerts to feed
        Object.entries(response.stress_test_results).forEach(([scenario, result]) => {
          addFeedItem({
            id: `stress-${scenario}-${Date.now()}`,
            type: 'warning',
            agentId,
            title: `Stress Test: ${scenario}`,
            content: `Portfolio loss: ${result.portfolio_loss_percent.toFixed(2)}%`,
            timestamp: new Date(),
            severity: result.portfolio_loss_percent < -20 ? 'high' : 'medium',
            actionable: true,
          });
        });

        updateAgentStatus(agentId, 'idle');
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateAgentStatus, addFeedItem]
  );



  const calculateMetrics = useCallback(
    async (portfolioData: Record<string, unknown>) => {
      setIsLoading(true);
      setError(null);

      try {
        const agentId: AgentType = 'performance';
        updateAgentStatus(agentId, 'analyzing');

        const response = await agentAPIClient.calculatePerformanceMetrics(portfolioData);

        // Add performance insight to feed
        addFeedItem({
          id: `perf-${Date.now()}`,
          type: 'insight',
          agentId,
          title: response.outperforming_benchmark ? 'Outperforming Benchmark' : 'Benchmark Underperformance',
          content: `Review detailed performance metrics and attribution analysis`,
          timestamp: new Date(),
          severity: response.outperforming_benchmark ? 'low' : 'medium',
          actionable: true,
        });

        updateAgentStatus(agentId, 'idle');
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateAgentStatus, addFeedItem]
  );

  return {
    isLoading,
    error,
    analyzeWithAgent,
    runStressTest,
    calculateMetrics,
  };
}
