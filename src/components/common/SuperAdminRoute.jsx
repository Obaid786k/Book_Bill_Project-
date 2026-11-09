import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { PermissionDenied } from './states';

// Super admin pages: only when the user's role in the database is admin
// (profiles.is_super_admin = true). The server checks it again for the data.
export const SuperAdminRoute = () => {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  if (!isAdmin) return <PermissionDenied />;
  return <Outlet />;
};
