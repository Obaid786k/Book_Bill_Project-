import React from 'react';
import { clsx } from 'clsx';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2';

// Segmented control (7D | 30D | 12M ...). Selected = navy filled, same as other tabs in the app.
export const Segmented = ({ options, value, onChange, label, children }) => (
  <div className="flex bg-row-alt border border-bb2 rounded-[9px] p-[3px]" role="group" aria-label={label}>
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        aria-pressed={value === o.value}
        onClick={() => onChange(o.value)}
        className={clsx('h-7 px-3 rounded-md text-[12px] font-semibold transition-colors', FOCUS,
          value === o.value ? 'bg-navy text-white shadow-sm' : 'text-ink2 hover:text-navy hover:bg-paper')}
      >
        {o.label}
      </button>
    ))}
    {children}
  </div>
);

// Tick box used to show / hide a series ("Compare", "Profit" ...). Swatch shows the series colour.
export const SeriesToggle = ({ checked, onChange, label, swatch, dashed = false }) => (
  <label className="inline-flex items-center gap-2 h-7 px-2 rounded-md text-[12px] font-medium text-ink cursor-pointer select-none hover:bg-row-alt">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-navy w-4 h-4" />
    {swatch && (
      <span
        className={clsx('w-[14px]', dashed ? 'border-t-2 border-dashed' : 'h-[3px] rounded')}
        style={dashed ? { borderColor: swatch } : { background: swatch }}
      />
    )}
    {label}
  </label>
);

