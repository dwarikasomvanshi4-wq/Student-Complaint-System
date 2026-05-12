import axios from 'axios';

/**
 * Configured Axios instance for client-side API calls.
 *
 * - Sends cookies automatically via `withCredentials: true`
 * - Intercepts 401 responses and redirects to /login (client-side only)
 *
 * Requirements: 2.4, 3.7
 */
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined'
    ) {
      const publicPaths = ['/login', '/register', '/', '/about', '/contact'];
      const isPublic = publicPaths.some((p) => window.location.pathname === p);
      // Only redirect if we're on a protected page, not already on a public/auth page
      if (!isPublic) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
