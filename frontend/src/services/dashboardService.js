import ApiClient from '../api/apiClient';

export const DashboardService = {
  /**
   * Fetch municipal resource inventory & availability
   */
  async getResources() {
    return ApiClient.get('/dashboard/resources');
  },

  /**
   * Run resource-constrained prioritization allocation
   */
  async runPrioritization() {
    return ApiClient.post('/dashboard/prioritize', {});
  }
};

export default DashboardService;