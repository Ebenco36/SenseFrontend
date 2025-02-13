import { apiService } from '@/utils/apiService';
// import type { ResponseData } from '@/types/my-types/Journal';

// Fetch journal information by ID
export const fetchJournalinformation = async (id: string) => {
  const response = apiService({
    path: `/details/${id}`,
    method: 'GET'
  });

  return response;
};
