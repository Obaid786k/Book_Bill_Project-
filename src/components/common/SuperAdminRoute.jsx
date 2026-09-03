import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { PermissionDenied } from './states';

export const SuperAdminRoute = () => {
  const { isAdmin } = useAuthStore();

  // Intentionally disabled until backend auth/role checks are wired up —
  // real admin enforcement will happen server-side. Re-enable this once
  // APIs are connected, so it acts as a second layer, not the only one.
  // if (!isAdmin) {
  //   return <PermissionDenied />;
  // }

  return <Outlet />;
};
