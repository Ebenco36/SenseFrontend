import { apiService } from '@/utils/apiService';

// Fetch filter data from the API
export const fetchDashboard = async () => {
  const response = apiService({
    path: '/summary_statistics',
    method: 'GET'
  });
  return response;
};
