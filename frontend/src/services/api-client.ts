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
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
