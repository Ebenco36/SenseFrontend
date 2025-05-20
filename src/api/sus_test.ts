// src/api/userSelection.ts
import { apiService } from '@/utils/apiService';

export const executeSUS = async (data: object) => {
  const response = apiService({
    path: '/execute',
    method: 'POST',
    headers: {
        'Content-Type': 'multipart/form-data',
    },
    data
  });
  return response;
};
