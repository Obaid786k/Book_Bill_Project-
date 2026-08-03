/**
 * ServerError500 component
 * Renders a full-screen 500 error state.
 */
import React from 'react';
import { ServerCrash } from 'lucide-react';
import { EmptyState } from '../EmptyState';

const ServerError500 = () => {
  return (
    <div className="fixed inset-0 bg-bg z-[999] flex items-center justify-center min-h-screen p-6">
      <EmptyState
        icon={ServerCrash}
        title="Internal Server Error"
        description="Something went wrong on our end. We've been notified and are looking into it."
        actionLabel="Refresh Page"
        onAction={() => window.location.reload()}
      />
    </div>
  );
};

export default ServerError500;
