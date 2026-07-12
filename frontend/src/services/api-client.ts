/**
 * AssetFlow ERP
 *
 * Layer:
 * Infrastructure (Frontend specific)
 *
 * Responsibility:
 * Pre-configured Axios instance for backend communication.
 *
 * Architectural Rules:
 * - Automatically injects JWT tokens (if present).
 * - Intercepts 401 Unauthorized for automatic logouts.
 */
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        console.error('Forbidden access:', error.response.data);
      } else if (status === 404) {
        console.error('Resource not found:', error.response.data);
      } else if (status === 409) {
        console.error('Conflict:', error.response.data);
      } else if (status === 422) {
        console.error('Validation error:', error.response.data);
      } else if (status >= 500) {
        console.error('Server error:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);
