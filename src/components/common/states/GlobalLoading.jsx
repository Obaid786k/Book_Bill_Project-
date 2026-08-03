/**
 * GlobalLoading component
 * Renders a full-screen loading state.
 */
import React from 'react';
import { Loader2 } from 'lucide-react';

const GlobalLoading = () => {
  return (
    <div className="fixed inset-0 bg-bg z-[999] flex flex-col items-center justify-center min-h-screen">
      <Loader2 size={48} className="text-navy animate-spin mb-4" />
      <h2 className="text-xl font-bold text-navy mb-2">Loading</h2>
      <p className="text-ink2 text-[14px]">Please wait while we set things up...</p>
    </div>
  );
};

export default GlobalLoading;
