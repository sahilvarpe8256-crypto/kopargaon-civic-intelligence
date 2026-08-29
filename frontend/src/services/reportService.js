import ApiClient from '../api/apiClient';

export const ReportService = {
  /**
   * Submit citizen report with multipart form data
   */
  async submitReport(formData) {
    return ApiClient.post('/reports', formData, true);
  },

  /**
   * Fetch complaint queue with filters and sorting
   */
  async getReports(params = {}) {
    return ApiClient.get('/reports', params);
  },

  /**
   * Fetch single complaint details by ID (reportId or Mongo ID)
   */
  async getReportById(id) {
    return ApiClient.get(`/reports/${id}`);
  },

  /**
   * Update complaint status or assign resources (Officer Action)
   */
  async updateStatus(id, updateData) {
    return ApiClient.patch(`/reports/${id}/status`, updateData);
  }
};

export default ReportService;