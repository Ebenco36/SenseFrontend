// src/api/userSelection.ts
import { apiService } from '@/utils/apiService';

export const postUserSelectionProcess = async (data: object) => {
  const response = apiService({
    path: '/user-selection-process',
    method: 'POST',
    data
  });
  return response;
};

// Example for GET method
export const fetchUserSelectionProcess = async (params: Record<string, unknown>) => {
  return apiService({
    path: '/user-selection-process',
    method: 'GET',
    params
  });
};
