/**
 * NoInternet component
 * Renders a full-screen offline state.
 */
import React from 'react';
import { WifiOff } from 'lucide-react';
import { EmptyState } from '../EmptyState';

const NoInternet = () => {
  return (
    <div className="fixed inset-0 bg-bg z-[999] flex items-center justify-center min-h-screen p-6">
      <EmptyState
        icon={WifiOff}
        title="No Internet Connection"
        description="You appear to be offline. Please check your network connection and try again."
        actionLabel="Retry Connection"
        onAction={() => window.location.reload()}
      />
    </div>
  );
};

export default NoInternet;
