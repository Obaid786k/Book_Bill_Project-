import React, { forwardRef } from 'react';
import { TextInput } from './TextInput';

export const PhoneField = forwardRef(({
  prefix = '+91',
  ...props
}, ref) => {
  return (
    <div className="relative w-full">
      <div className="absolute left-1 top-[22px] text-[12px] text-ink2 pointer-events-none">
        {prefix}
      </div>
      <TextInput
        ref={ref}
        type="tel"
        className="pl-8"
        {...props}
      />
    </div>
  );
});

PhoneField.displayName = 'PhoneField';
