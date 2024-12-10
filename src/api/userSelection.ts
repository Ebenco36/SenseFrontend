// src/api/userSelection.ts

import { apiService } from '@/utils/apiService';
import type { UserSelectionPayload, ApiResponse } from '@/types/my-types/Journals';

export const postUserSelectionProcess = async (
  data: UserSelectionPayload
): Promise<ApiResponse> => {
  return apiService({
    path: '/user-selection-process',
    method: 'POST',
    data,
  });
};

// Example for GET method
export const fetchUserSelectionProcess = async (
  params: Record<string, unknown>
): Promise<ApiResponse> => {
  return apiService({
    path: '/user-selection-process',
    method: 'GET',
    params,
  });
};
