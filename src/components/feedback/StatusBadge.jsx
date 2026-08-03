import React from 'react';
import { clsx } from 'clsx';

export const StatusBadge = ({ status, className }) => {
  const normalizedStatus = status?.toLowerCase();
  
  let bgClass = "bg-bb text-ink"; // Default
  let label = status;

  if (normalizedStatus === 'paid') {
    bgClass = "bg-green text-white";
  } else if (normalizedStatus === 'partial') {
    bgClass = "bg-gold text-white";
  } else if (normalizedStatus === 'unpaid') {
    bgClass = "bg-red text-white";
  } else if (normalizedStatus === 'draft') {
    bgClass = "bg-row-alt text-ink border border-bb2";
  }

  return (
    <span className={clsx(
      "inline-flex items-center justify-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.5px]",
      bgClass,
      className
    )}>
      {label}
    </span>
  );
};
