import React from 'react';
import { clsx } from 'clsx';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={clsx(
        "animate-pulse bg-bb rounded",
        className
      )}
      {...props}
    />
  );
};
