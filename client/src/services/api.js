import axios from 'axios';

// When deployed (e.g. on Vercel), VITE_API_URL points to the backend (e.g. https://serviceman-backend.onrender.com)
// In local development, if VITE_API_URL is empty, it falls back to '/api' (proxied by Vite)
const rawApiUrl = import.meta.env.VITE_API_URL;
let baseURL = '/api';

if (rawApiUrl && rawApiUrl.trim() !== '') {
  const cleanUrl = rawApiUrl.trim().replace(/\/+$/, '');
  baseURL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('serviceman_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle session expiry / account restrictions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('serviceman_token');
        localStorage.removeItem('serviceman_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
