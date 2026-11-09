import React from 'react';
import { clsx } from 'clsx';

// Same card surface as the Dashboard (white, soft border, 12px corners).
export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-paper border border-bb2 rounded-[12px] shadow-[0_1px_2px_rgba(15,28,46,0.04)] overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
