import { create } from 'zustand';

export const useUIStore = create((set) => ({
  isBillingDirty: false,
  setBillingDirty: (val) => set({ isBillingDirty: val }),
  pendingNavPath: null,
  setPendingNavPath: (path) => set({ pendingNavPath: path }),
  reset: () => set({ isBillingDirty: false, pendingNavPath: null })
}));
