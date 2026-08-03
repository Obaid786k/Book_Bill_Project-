import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(({
  label,
  error,
  options = [],
  className,
  wrapperClassName,
  ...props
}, ref) => {
  return (
    <div className={clsx("flex flex-col gap-1 w-full", wrapperClassName)}>
      {label && <label className="text-[11px] font-semibold text-ink2 uppercase tracking-[0.3px]">{label}</label>}
      <div className="relative w-full">
        <select
          ref={ref}
          className={clsx(
            "font-body border-none border-b border-dashed border-navy-lt bg-transparent outline-none py-1 px-1 pr-6 text-[12px] text-ink transition-colors w-full focus:border-b-solid focus:border-navy appearance-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
            error && "border-red focus:border-red",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-navy">
          <ChevronDown size={14} />
        </div>
      </div>
      {error && <span className="text-red text-[10px] mt-0.5">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';
