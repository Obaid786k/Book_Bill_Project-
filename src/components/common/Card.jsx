import React from 'react';
import { clsx } from 'clsx';

export const Card = ({ children, className, ...props }) => {
  return (
    <div 
      className={clsx(
        "bg-paper border border-bb rounded-[7px] shadow-[0_2px_14px_rgba(0,0,0,0.07)] overflow-hidden", 
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
