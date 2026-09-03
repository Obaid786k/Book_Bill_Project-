import React from 'react';
import { clsx } from 'clsx';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div className={clsx("flex flex-col items-center justify-center p-8 sm:p-12 text-center", className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-row-alt flex items-center justify-center mb-5 text-navy-lt">
          <Icon size={32} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-[15px] font-bold text-navy mb-2">{title}</h3>
      <p className="text-[12.5px] text-ink2 max-w-[300px] mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
