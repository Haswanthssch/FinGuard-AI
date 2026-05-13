/**
 * Chat Service
 * Handles AI agent chat interactions
 */
import apiClient from '@/api/client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SendMessageRequest {
  message: string;
  session_id?: string;
  portfolio_id?: string;
  context?: Record<string, unknown>;
}

export interface ChatResponse {
  session_id: string;
  response: string;
  citations: Array<{
    title?: string;
    source?: string;
    source_url?: string;
    url?: string;
    page?: number;
    content?: string;
    regulator?: string;
  }>;
  llm_source: string;
  skills_used: string[];
}

export const chatService = {
  /**
   * Send message to AI agent
   */
  async sendMessage(request: SendMessageRequest): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>('/api/v1/chat', request);
    return response.data;
  },

  /**
   * Get chat history for a session
   */
  async getHistory(sessionId: string): Promise<ChatMessage[]> {
    const response = await apiClient.get<ChatMessage[]>(`/api/v1/chat/history/${sessionId}`);
    return response.data;
  },

  /**
   * Clear chat history for a session
   */
  async clearHistory(sessionId: string): Promise<void> {
    await apiClient.delete(`/api/v1/chat/history/${sessionId}`);
  },
};

export default chatService;
