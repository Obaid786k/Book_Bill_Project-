import { create } from 'zustand';
import { authService } from '../services/authService';

// No more zustand `persist` middleware — the real session lives in
// Supabase (its own localStorage key, managed by supabase-js), so
// persisting a second copy here would just be a second source of truth
// that could drift out of sync. `initialize()` below restores state from
// the real session on every page load instead.

// Guard: ensure the onAuthStateChange listener is only ever registered once,
// even if initialize() is somehow called more than once.
let _listenerRegistered = false;

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isBusinessSetup: false,
  isAdmin: false,
  isInitializing: true, // true until the first session check completes

  login: (userData) => set({
    user: userData,
    isAuthenticated: true,
    isBusinessSetup: userData.hasCompletedSetup || false,
    isAdmin: userData.isAdmin || false,
  }),

  completeSetup: () => set((state) => ({
    isBusinessSetup: true,
    user: { ...state.user, hasCompletedSetup: true },
  })),

  logout: async () => {
    await authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      isBusinessSetup: false,
      isAdmin: false,
    });
  },

  // Called once when the app boots (see App.jsx). Restores a session if
  // one exists, so refreshing the page doesn't bounce a logged-in user
  // back to /login.
  initialize: async () => {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        set({
          user: userData,
          isAuthenticated: true,
          isBusinessSetup: userData.hasCompletedSetup || false,
          isAdmin: userData.isAdmin || false,
          isInitializing: false,
        });
      } else {
        set({ isInitializing: false });
      }
    } catch {
      set({ isInitializing: false });
    }

    // Keep the store in sync if the session changes elsewhere (another
    // tab signs out, token refresh fails, etc.)
    // Guard prevents duplicate listeners if initialize() is called multiple times.
    if (_listenerRegistered) return;
    _listenerRegistered = true;

    authService.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Do not redirect the original waiting tab; only redirect if they landed elsewhere
        if (window.location.pathname !== '/forgot-password') {
          window.location.href = '/reset-password';
        }
      }
      if (!session) {
        set({ user: null, isAuthenticated: false, isBusinessSetup: false, isAdmin: false });
      }
    });
  },
}));
