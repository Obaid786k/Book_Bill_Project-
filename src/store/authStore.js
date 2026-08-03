import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isBusinessSetup: false,
      isAdmin: false,

      login: (userData) => set({ 
        user: userData, 
        isAuthenticated: true,
        // Mock logic: if they login as a new user, they might not be setup
        isBusinessSetup: userData.hasCompletedSetup || false,
        isAdmin: userData.email === 'admin@test.com' // Mock admin logic
      }),
      
      completeSetup: () => set((state) => ({ 
        isBusinessSetup: true,
        user: { ...state.user, hasCompletedSetup: true }
      })),

      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        isBusinessSetup: false,
        isAdmin: false
      }),
    }),
    {
      name: 'billbook-auth-storage',
    }
  )
);
