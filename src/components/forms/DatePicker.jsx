import React, { forwardRef } from 'react';
import { TextInput } from './TextInput';

export const DatePicker = forwardRef(({
  ...props
}, ref) => {
  return (
    <TextInput
      ref={ref}
      type="date"
      className="font-mono"
      {...props}
    />
  );
});

DatePicker.displayName = 'DatePicker';
