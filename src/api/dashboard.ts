import { apiService } from '@/utils/apiService';
import type { ApiResponse } from '@/types/my-types/dashboard';

// Fetch filter data from the API
export const fetchDashboard = async (): Promise<ApiResponse> => {
  return apiService<ApiResponse>({
    path: '/summary_statistics',
    method: 'GET',
  });
};
