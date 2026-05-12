import axios from 'axios';

/**
 * Configured Axios instance for client-side API calls.
 *
 * Uses relative URLs (no baseURL) so it works on any domain —
 * localhost in dev, Vercel in production — without needing NEXT_PUBLIC_APP_URL.
 *
 * Requirements: 2.4, 3.7
 */
const axiosClient = axios.create({
  // No baseURL — all paths like '/api/auth/login' are relative to the current origin.
  // This works correctly on both localhost and any deployed domain.
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
      if (!isPublic) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
