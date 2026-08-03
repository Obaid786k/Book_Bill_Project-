import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { PermissionDenied } from './states';

export const SuperAdminRoute = () => {
  const { isAdmin } = useAuthStore();

  if (!isAdmin) {
    return <PermissionDenied />;
  }

  return <Outlet />;
};
