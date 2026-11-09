import React from 'react';
import { clsx } from 'clsx';

// One status pill for the whole app (Dashboard, Bill History).
const STYLES = {
  paid: 'bg-[#E7F3EC] text-green',
  pending: 'bg-[#FFF4E5] text-gold',
  partial: 'bg-[#FFF4E5] text-gold',
  overdue: 'bg-[#FDECEC] text-red',
  unpaid: 'bg-[#FDECEC] text-red',
  cancelled: 'bg-ink/10 text-ink3 line-through',
};

export const StatusBadge = ({ status, className }) => {
  const label = status || 'Pending';
  return (
    <span
      className={clsx(
        'px-2 py-0.5 text-[11px] font-semibold rounded-full inline-flex items-center justify-center whitespace-nowrap',
        STYLES[label.toLowerCase()] || 'bg-ink/10 text-ink',
        className
      )}
    >
      {label}
    </span>
  );
};
