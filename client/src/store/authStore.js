import { create } from 'zustand';
import api from '../api/axios';
import { setCookie, getCookie, eraseCookie } from '../utils/cookies';

const savedInfo = getCookie('iste_login_info');

const useAuthStore = create((set) => ({
  // State
  user: savedInfo?.user || null,
  profile: savedInfo?.profile || null,
  isAuthenticated: !!savedInfo,
  isLoading: !savedInfo, // true until initial auth check completes if no cached session

  // Actions
  login: async (identifier, password) => {
    try {
      const response = await api.post('/auth/login', { identifier, password });

      if (response.data.success) {
        const { user, profile } = response.data.data;
        setCookie('iste_login_info', { user, profile }, 7); // Save login info in client cookie for 7 days
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
      eraseCookie('iste_login_info');
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
        setCookie('iste_login_info', { user, profile }, 7); // Keep cookie fresh
        set({
          user,
          profile,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch {
      eraseCookie('iste_login_info');
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
  clearAuth: () => {
    eraseCookie('iste_login_info');
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));

export default useAuthStore;
