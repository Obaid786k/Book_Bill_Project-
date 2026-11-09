import React, { useLayoutEffect, useRef } from 'react';

// Textarea that grows with its text — no inner scrollbar, so nothing is hidden
// on screen or cut off when the invoice is printed.
export const AutoTextarea = ({ value, minHeight = 0, style, ...props }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight + 2, minHeight)}px`;
  }, [value, minHeight]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      style={{ overflow: 'hidden', resize: 'none', ...style }}
      {...props}
    />
  );
};
