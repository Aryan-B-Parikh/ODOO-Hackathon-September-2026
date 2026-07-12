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
    // Placeholder for global error interceptors (e.g., 401 redirects)
    return Promise.reject(error);
  }
);
