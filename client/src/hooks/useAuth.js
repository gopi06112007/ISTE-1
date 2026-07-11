import useAuthStore from '../store/authStore';

/**
 * Custom hook for auth state and actions.
 * Provides convenient access to auth store with computed properties.
 */
const useAuth = () => {
  const {
    user,
    profile,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
    setProfile,
  } = useAuthStore();

  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
    setProfile,

    // Computed properties
    isStudent: user?.role === 'student_coordinator',
    isBranchFaculty: user?.role === 'branch_faculty',
    isCentral: user?.role === 'central_faculty',
    isFaculty: user?.role === 'branch_faculty' || user?.role === 'central_faculty',
    userBranch: user?.branch || null,
    userName: profile?.name || user?.email || user?.jntuNo || 'User',
  };
};

export default useAuth;
