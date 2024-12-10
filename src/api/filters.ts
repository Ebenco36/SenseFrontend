import { apiService } from '@/utils/apiService';
import type { FiltersApiResponse } from '@/types/my-types/filters';

// Fetch filter data from the API
export const fetchFilters = async (): Promise<FiltersApiResponse> => {
  return apiService<FiltersApiResponse>({
    path: '/record/filters',
    method: 'GET',
  });
};
