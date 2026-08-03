import React, { forwardRef } from 'react';
import { TextInput } from './TextInput';

export const PercentageField = forwardRef(({
  ...props
}, ref) => {
  return (
    <div className="relative w-full">
      <TextInput
        ref={ref}
        type="number"
        step="0.1"
        className="pr-5 font-mono"
        {...props}
      />
      <div className="absolute right-1 top-[22px] text-[12px] text-ink2 font-mono pointer-events-none">
        %
      </div>
    </div>
  );
});

PercentageField.displayName = 'PercentageField';
