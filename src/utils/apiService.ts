// src/utils/apiService.ts

import httpService from '@/utils/helpers/httpService';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface ApiRequestConfig {
  path: string; // API endpoint path
  method: HttpMethod; // HTTP method
  data?: unknown; // Payload for POST/PUT requests
  params?: Record<string, unknown>; // Query parameters for GET requests
  headers?: Record<string, string>; // Optional headers
}

export interface ApiResponse<T = unknown> {
  data: T; // Generic data type for the response payload
  message?: string;
  status?: number;
}

export const apiService = async (config: ApiRequestConfig) => {
  const { path, method, data, params, headers } = config;

  const requestConfig: AxiosRequestConfig = {
    url: path,
    method,
    data,
    params,
    headers
  };

  try {
    const response: AxiosResponse = await httpService.request(requestConfig);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    if (typeof error === 'object' && error !== null && 'response' in error) {
      const errObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errObj.response?.data?.message || 'Unknown error');
    }

    throw new Error('Unknown error occurred');
  }
};
