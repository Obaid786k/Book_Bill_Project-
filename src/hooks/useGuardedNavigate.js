import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';
import { getRouteMeta } from '../config/navigation';

// Navigation that respects the unsaved New Bill guard.
// While a bill has unsaved changes, New Bill shows its "Unsaved changes"
// dialog first and then continues to the requested place.
export const useGuardedNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const go = useCallback((path, options) => {
    if (useUIStore.getState().isBillingDirty) {
      useUIStore.getState().setPendingNavPath(path);
      return;
    }
    navigate(path, options);
  }, [navigate]);

  const goBack = useCallback(() => {
    const hasHistory = location.key !== 'default' && (window.history.state?.idx ?? 0) > 0;
    if (useUIStore.getState().isBillingDirty) {
      useUIStore.getState().setPendingNavPath(hasHistory ? '__BACK__' : (getRouteMeta(location.pathname).parent ?? '/dashboard'));
      return;
    }
    if (hasHistory) navigate(-1);
    else navigate(getRouteMeta(location.pathname).parent ?? '/dashboard');
  }, [navigate, location.key, location.pathname]);

  return { go, goBack };
};
