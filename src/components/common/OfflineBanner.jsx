import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-500 text-white text-[13px] font-medium py-2 px-4 text-center sticky top-0 z-[99999] shadow-md flex items-center justify-center gap-2 transition-all">
      <WifiOff size={16} className="shrink-0" />
      <span>You're offline. Your changes are safe — we'll save them once you're back online.</span>
    </div>
  );
};

export default OfflineBanner;
