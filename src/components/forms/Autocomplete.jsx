import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { clsx } from 'clsx';
import { Search } from 'lucide-react';

export const Autocomplete = forwardRef(({
  label,
  error,
  options = [],
  value,
  onChange,
  onSelect,
  placeholder,
  className,
  wrapperClassName,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (opt) => {
    if (onChange) onChange(opt.label);
    if (onSelect) onSelect(opt);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={clsx("flex flex-col gap-1 w-full relative", wrapperClassName)}>
      {label && <label className="text-[11px] font-semibold text-ink2 uppercase tracking-[0.3px]">{label}</label>}
      <div className="relative">
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => {
            if (onChange) onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={clsx(
            "font-body border-none border-b border-dashed border-navy-lt bg-transparent outline-none py-1 px-1 pr-6 text-[12px] text-ink transition-colors w-full focus:border-b-solid focus:border-navy placeholder:text-ink3/60",
            error && "border-red focus:border-red",
            className
          )}
          {...props}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-ink3">
          <Search size={14} />
        </div>
      </div>
      {error && <span className="text-red text-[10px] mt-0.5">{error}</span>}
      
      {isOpen && options.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-bb2 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
          {options.map((opt, idx) => (
            <div
              key={opt.value || idx}
              className="px-3 py-2 text-[12px] text-ink hover:bg-row-alt cursor-pointer border-b border-bb2 last:border-b-0"
              onClick={() => handleSelect(opt)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

Autocomplete.displayName = 'Autocomplete';
