/**
 * PermissionDenied component
 * Renders a full-screen permission denied state.
 */
import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { EmptyState } from '../EmptyState';
import { useNavigate } from 'react-router-dom';

const PermissionDenied = () => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 bg-bg z-[999] flex items-center justify-center min-h-screen p-6">
      <EmptyState
        icon={ShieldAlert}
        title="Permission Denied"
        description="You don't have the required privileges to view this page. If you believe this is an error, contact support."
        actionLabel="Go to Dashboard"
        onAction={() => navigate('/dashboard')}
      />
    </div>
  );
};

export default PermissionDenied;
