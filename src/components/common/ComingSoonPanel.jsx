import React from 'react';
import { clsx } from 'clsx';
import { Button } from './Button';
import { Sparkles } from 'lucide-react';

export const ComingSoonPanel = ({
  icon: Icon = Sparkles,
  title = "Coming Soon",
  description = "We're building this feature next. For now, explore the features already available.",
  onDismiss,
  className
}) => {
  return (
    <div className={clsx("flex flex-col items-center justify-center p-8 sm:p-12 text-center h-full w-full", className)}>
      <div className="w-16 h-16 rounded-full bg-navy/5 flex items-center justify-center mb-5 text-navy-lt">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-[17px] font-display font-bold text-navy mb-2 tracking-wide">{title}</h3>
      <p className="text-[13px] text-ink2 max-w-[320px] mb-8 leading-relaxed">
        {description}
      </p>
      {onDismiss && (
        <Button onClick={onDismiss} variant="outline" className="px-6 border-navy-lt/30 text-navy hover:bg-navy/5">
          Got it
        </Button>
      )}
    </div>
  );
};
