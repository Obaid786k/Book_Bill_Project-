import { create } from 'zustand';

const readCollapsed = () => {
  try { return localStorage.getItem('bb_sidebar_collapsed') === '1'; } catch { return false; }
};

export const useUIStore = create((set) => ({
  isBillingDirty: false,
  setBillingDirty: (val) => set({ isBillingDirty: val }),
  // Path the user tried to open while New Bill had unsaved changes.
  // '/logout' = log out, '__BACK__' = go back one step.
  pendingNavPath: null,
  setPendingNavPath: (path) => set({ pendingNavPath: path }),
  reset: () => set({ isBillingDirty: false, pendingNavPath: null }),

  // "Log out?" confirm — one dialog in AppShell, opened from anywhere.
  logoutConfirmOpen: false,
  setLogoutConfirmOpen: (val) => set({ logoutConfirmOpen: val }),

  // Tablet icon rail (768–1279px). Remembered across visits.
  sidebarCollapsed: readCollapsed(),
  setSidebarCollapsed: (val) => {
    try { localStorage.setItem('bb_sidebar_collapsed', val ? '1' : '0'); } catch { /* ignore */ }
    set({ sidebarCollapsed: val });
  },
}));
