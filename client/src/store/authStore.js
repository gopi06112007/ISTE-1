import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true, // true until initial auth check completes

  // Actions
  login: async (identifier, password) => {
    try {
      const response = await api.post('/auth/login', { identifier, password });

      if (response.data.success) {
        const { user, profile } = response.data.data;
        set({
          user,
          profile,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Logout should always succeed locally even if API call fails
      console.error('Logout API error:', error);
    } finally {
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // Check if user is still authenticated (on app load)
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/me');

      if (response.data.success) {
        const { user, profile } = response.data.data;
        set({
          user,
          profile,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // Update profile in store (after editing)
  setProfile: (profile) => set({ profile }),

  // Clear auth state (called by axios 401 interceptor)
  clearAuth: () =>
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));

export default useAuthStore;
