// src/utils/httpService.ts

import axios, { type AxiosInstance } from 'axios';

// Get baseURL and headers from environment variables
const baseURL = import.meta.env.VITE_API_BASE_URL as string;
const contentType = import.meta.env.VITE_API_CONTENT_TYPE as string;

const httpService: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': contentType
  }
});

// Interceptor to handle errors globally if needed
httpService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default httpService;
