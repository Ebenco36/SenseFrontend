import { apiService } from '@/utils/apiService';
// import type { FiltersApiResponse } from '@/types/my-types/filters';

// Fetch filter data from the API
export const fetchFilters = async () => {
  const response = await apiService({
    path: '/record/filters',
    method: 'GET'
  });

  return response;
};
