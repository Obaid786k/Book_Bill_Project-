import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const ProtectedRoute = ({ authOnly = false }) => {
  const { isAuthenticated, isBusinessSetup } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!authOnly && !isBusinessSetup) {
    return <Navigate to="/setup" replace />;
  }

  return <Outlet />;
};
