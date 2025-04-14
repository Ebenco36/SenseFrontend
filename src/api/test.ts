// src/api/userSelection.ts
import { apiService } from '@/utils/apiService';

export const uploadProcessing = async (data: object) => {
  const response = apiService({
    path: '/process-uploaded-file',
    method: 'POST',
    headers: {
        'Content-Type': 'multipart/form-data',
    },
    data
  });
  return response;
};
