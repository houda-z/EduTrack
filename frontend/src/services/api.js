import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor — attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401/403 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired or invalid — clear storage and redirect to login
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (error.response.status === 403) {
        alert('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Get the current user data from localStorage.
 * NOTE: moyenne is NOT stored here — always fetch from API.
 */
export function getCurrentUser() {
  try {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export default api;