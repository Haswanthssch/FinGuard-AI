/**
 * Services Index
 * Central export for all API services
 */
export { authService, type LoginRequest, type RegisterRequest, type AuthResponse } from './authService';
export {
  portfolioService,
  type Portfolio,
  type Holding,
  type PortfolioWithHoldings,
  type CreatePortfolioRequest,
  type UploadCSVResponse,
} from './portfolioService';
export {
  chatService,
  type ChatMessage,
  type SendMessageRequest,
  type ChatResponse,
} from './chatService';
export {
  reportsService,
  type GenerateReportRequest,
  type Report,
} from './reportsService';

