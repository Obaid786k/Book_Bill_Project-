import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

export const TextInput = forwardRef(({
  label,
  error,
  className,
  wrapperClassName,
  ...props
}, ref) => {
  return (
    <div className={clsx("flex flex-col gap-1 w-full", wrapperClassName)}>
      {label && <label className="text-[11px] font-semibold text-ink2 uppercase tracking-[0.3px]">{label}</label>}
      <input
        ref={ref}
        className={clsx(
          "font-body border-none border-b border-dashed border-navy-lt bg-transparent outline-none py-1 px-1 text-[12px] text-ink transition-colors w-full focus:border-b-solid focus:border-navy placeholder:text-ink3/60 disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-red focus:border-red",
          className
        )}
        {...props}
      />
      {error && <span className="text-red text-[10px] mt-0.5">{error}</span>}
    </div>
  );
});

TextInput.displayName = 'TextInput';
