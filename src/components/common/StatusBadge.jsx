import React from 'react';
import { clsx } from 'clsx';

export const StatusBadge = ({ status, className }) => {
  const s = (status || 'Pending').toLowerCase();
  
  let colors = 'bg-ink/10 text-ink'; // default fallback
  
  if (s === 'paid') {
    colors = 'bg-green text-white';
  } else if (s === 'unpaid') {
    colors = 'bg-rose text-white';
  } else if (s === 'partial') {
    colors = 'bg-gold text-white';
  } else if (s === 'pending') {
    colors = 'bg-gold/80 text-white'; // slightly muted gold for pending
  }

  return (
    <span className={clsx("px-2.5 py-0.5 text-xs font-bold rounded-full inline-flex items-center justify-center tracking-wide", colors, className)}>
      {status || 'Pending'}
    </span>
  );
};
