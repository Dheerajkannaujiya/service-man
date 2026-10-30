import axios from 'axios';
import { handleMockRequest } from './mockService';

const rawApiUrl = import.meta.env.VITE_API_URL;
let baseURL = '/api';

if (rawApiUrl && rawApiUrl.trim() !== '') {
  const cleanUrl = rawApiUrl.trim().replace(/\/+$/, '');
  baseURL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
}

const api = axios.create({
  baseURL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Flag to track whether the real backend API is online
let isBackendOnline = false;

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('serviceman_token');
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: graceful offline fallback to interactive mock service
api.interceptors.response.use(
  (response) => {
    isBackendOnline = true;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Detect if backend is offline, unreachable, timed out, or returning unhandled 5xx / 404
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';
    const isServerDown = error.response && (error.response.status >= 500 || error.response.status === 404);
    
    // Also catch 401 for instant demo logins when backend database is unseeded
    const isDemoLoginAttempt =
      error.response &&
      error.response.status === 401 &&
      originalRequest.url?.includes('/auth/login');

    if (isNetworkError || isServerDown || isDemoLoginAttempt) {
      console.warn(`[ServiceMan API] Live backend unavailable (${error.message || error.response?.status}). Seamlessly routing to interactive mock service.`);
      try {
        const mockResponse = await handleMockRequest(originalRequest);
        return mockResponse;
      } catch (mockErr) {
        return Promise.reject(mockErr);
      }
    }

    if (error.response && error.response.status === 401) {
      // Token truly invalid or unauthorized on live server
      localStorage.removeItem('serviceman_token');
      localStorage.removeItem('serviceman_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    return Promise.reject(error);
  }
);

export default api;
