import React from 'react';
import { ComingSoonPanel } from '../../components/common/ComingSoonPanel';
import { ToggleRight } from 'lucide-react';

export const FeatureFlags = () => {
  return (
    <div className="h-[60vh] bg-paper rounded-lg border border-white/10 flex items-center justify-center p-6">
      <ComingSoonPanel 
        icon={ToggleRight}
        title="Feature Flag Management"
        description="Soon you will be able to toggle experimental features, enable beta access for specific tenants, and manage progressive rollouts from this console."
      />
    </div>
  );
};

export default FeatureFlags;
