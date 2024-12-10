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
  message: string;
  status: number;
}

export const apiService = async <T = unknown>(config: ApiRequestConfig): Promise<ApiResponse<T>> => {
  const { path, method, data, params, headers } = config;

  const requestConfig: AxiosRequestConfig = {
    url: path,
    method,
    data,
    params,
    headers,
  };

  try {
    const response: AxiosResponse<ApiResponse<T>> = await httpService.request(requestConfig);
    return response.data;
  } catch (error: any) {
    console.error(`Error in API call to ${path}:`, error);
    throw new Error(error.response?.data?.message || 'Unknown error');
  }
};
