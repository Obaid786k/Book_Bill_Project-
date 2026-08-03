import React from 'react';
import { clsx } from 'clsx';

export const ComingSoonBadge = ({ className }) => {
  return (
    <span className={clsx(
      "inline-block bg-gold/15 text-gold-dk px-2 py-[2px] rounded-full text-[9px] font-bold uppercase tracking-widest leading-none ml-2 align-middle",
      className
    )}>
      Soon
    </span>
  );
};
