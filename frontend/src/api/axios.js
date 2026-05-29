import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 30000, // 30 seconds for heavy payroll runs
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Session Expired
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login
      if (!window.location.pathname.includes('/login')) {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
    }

    // Network / Server Error
    if (!err.response) {
      toast.error('Network error. Please check your connection or contact support.');
    }

    // Server side explicit errors are usually handled in components, 
    // but we can log them here for debugging
    if (err.response?.status >= 500) {
      console.error('Server Error:', err.response.data);
    }

    return Promise.reject(err);
  }
);

export default api;
