import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Send cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state — import dynamically to avoid circular deps
      import('../store/authStore').then((module) => {
        const authStore = module.default;
        const state = authStore.getState();

        // Only clear and redirect if user was previously authenticated
        if (state.isAuthenticated) {
          state.clearAuth();

          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      });
    }
    return Promise.reject(error);
  }
);

export default api;
