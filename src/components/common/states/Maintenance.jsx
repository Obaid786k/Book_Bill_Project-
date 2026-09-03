/**
 * Maintenance component
 * Renders a full-screen maintenance state.
 */
import React from 'react';
import { Wrench } from 'lucide-react';
import { EmptyState } from '../EmptyState';

const Maintenance = () => {
  return (
    <div className="fixed inset-0 bg-bg z-[999] flex items-center justify-center min-h-screen p-6">
      <EmptyState
        icon={Wrench}
        title="Under Maintenance"
        description="We are currently performing scheduled maintenance. Bill Book will be back online shortly."
        actionLabel="Refresh Page"
        onAction={() => window.location.reload()}
      />
    </div>
  );
};

export default Maintenance;
