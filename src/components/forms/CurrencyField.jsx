import React, { forwardRef } from 'react';
import { TextInput } from './TextInput';

export const CurrencyField = forwardRef(({
  prefix = '₹',
  ...props
}, ref) => {
  return (
    <div className="relative w-full">
      <div className="absolute left-1 top-[22px] text-[12px] text-ink2 font-mono pointer-events-none">
        {prefix}
      </div>
      <TextInput
        ref={ref}
        type="number"
        step="0.01"
        className="pl-5 font-mono"
        {...props}
      />
    </div>
  );
});

CurrencyField.displayName = 'CurrencyField';
