import { apiService } from '@/utils/apiService';
import type { ResponseData } from '@/types/my-types/Journal';

// Fetch journal information by ID
export const fetchJournalinformation = async (id: string): Promise<ResponseData> => {
  return apiService<ResponseData>({
    path: `/details/${id}`,
    method: 'GET',
  });
};
