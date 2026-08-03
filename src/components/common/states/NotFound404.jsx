/**
 * NotFound404 component
 * Renders a full-screen 404 state.
 */
import React from 'react';
import { FileQuestion } from 'lucide-react';
import { EmptyState } from '../EmptyState';
import { useNavigate } from 'react-router-dom';

const NotFound404 = () => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 bg-bg z-[999] flex items-center justify-center min-h-screen p-6">
      <EmptyState
        icon={FileQuestion}
        title="Page Not Found"
        description="The page you are looking for doesn't exist or has been moved."
        actionLabel="Go to Dashboard"
        onAction={() => navigate('/dashboard')}
      />
    </div>
  );
};

export default NotFound404;
