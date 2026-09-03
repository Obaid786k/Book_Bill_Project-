import React, { forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

// Same visual language as TextInput — just adds a show/hide toggle.
// Drop-in replacement anywhere a password TextInput is used.
export const PasswordInput = forwardRef(({
  label,
  error,
  hint,
  className,
  wrapperClassName,
  ...props
}, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className={clsx("flex flex-col gap-1 w-full", wrapperClassName)}>
      {label && <label className="text-[11px] font-semibold text-ink2 uppercase tracking-[0.3px]">{label}</label>}
      <div className="relative w-full">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={clsx(
            "font-body border-none border-b border-dashed border-navy-lt bg-transparent outline-none py-1 px-1 pr-7 text-[12px] text-ink transition-colors w-full focus:border-b-solid focus:border-navy placeholder:text-ink3/60 disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red focus:border-red",
            className
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible(v => !v)}
          className="absolute right-0.5 top-1/2 -translate-y-1/2 text-ink3 hover:text-navy transition-colors p-0.5"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </div>
      {error && <span className="text-red text-[10px] mt-0.5">{error}</span>}
      {hint && <span className="text-ink3 text-[10px] mt-0.5">{hint}</span>}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';
