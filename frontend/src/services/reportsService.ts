/**
 * Reports Service
 * Handles report generation (PDF, Excel)
 */
import apiClient from '@/api/client';

export interface GenerateReportRequest {
  portfolio_id: string;
  report_type: 'summary' | 'detailed' | 'tax';
  format: 'pdf' | 'excel';
  include_charts?: boolean;
}

export interface Report {
  report_id: string;
  portfolio_id: string;
  report_type: string;
  format: string;
  file_url: string;
  created_at: string;
}

export const reportsService = {
  /**
   * Generate PDF report
   */
  async generatePDF(portfolioId: string, reportType: 'summary' | 'detailed' | 'tax' = 'summary'): Promise<Blob> {
    const response = await apiClient.post(
      `/api/v1/reports/pdf`,
      { portfolio_id: portfolioId, report_type: reportType },
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * Generate Excel report
   */
  async generateExcel(portfolioId: string): Promise<Blob> {
    const response = await apiClient.post(
      `/api/v1/reports/excel`,
      { portfolio_id: portfolioId },
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * Get all reports for a portfolio
   */
  async getReports(portfolioId: string): Promise<Report[]> {
    const response = await apiClient.get<Report[]>(`/api/v1/reports?portfolio_id=${portfolioId}`);
    return response.data;
  },

  /**
   * Download report by ID
   */
  async downloadReport(reportId: string): Promise<Blob> {
    const response = await apiClient.get(`/api/v1/reports/${reportId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default reportsService;
