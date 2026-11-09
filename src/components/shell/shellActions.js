import { useUIStore } from '../../store/uiStore';

export const initialsOf = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'U';
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
};

// Log out always asks first. If a bill has unsaved changes, New Bill's
// "Unsaved changes" dialog comes first, then the "Log out?" confirm.
export const requestLogout = () => {
  const ui = useUIStore.getState();
  if (ui.isBillingDirty) ui.setPendingNavPath('/logout');
  else ui.setLogoutConfirmOpen(true);
};
