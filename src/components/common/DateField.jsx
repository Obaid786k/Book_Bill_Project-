import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar } from 'lucide-react';
import { RangeCalendar } from './RangeCalendar';
import { parseLocalDate, isValidDateStr } from '../../utils/date';

const CAL_W = 300;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2026-11-09" -> "09 Nov 2026" (clear, no day/month mix-up; standard on Indian invoices)
const display = (v) => {
  if (!isValidDateStr(v)) return '';
  const d = parseLocalDate(v);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

// Date on the invoice:
//  - shows as plain text ("09 Nov 2026"), right-aligned like the invoice number (also when printed)
//  - click the date to type it (dd-mm-yyyy); click the calendar icon for the app calendar
// The calendar opens in a layer above the page (the invoice paper clips its own overflow).
export const DateField = ({ value, onChange, min = '', max = '', label = 'date' }) => {
  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pos, setPos] = useState(null);

  const place = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const left = Math.max(8, Math.min(r.left, window.innerWidth - CAL_W - 8));
    const below = r.bottom + 6;
    const top = below + 330 > window.innerHeight ? Math.max(8, r.top - 336) : below;
    setPos({ top, left });
  };

  useLayoutEffect(() => { if (open) place(); }, [open]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); } };
    const onMove = () => setOpen(false); // page scrolled/resized: close instead of drifting
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [open]);

  return (
    <span className="bb-date-field">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Pick ${label} from calendar`}
        aria-expanded={open}
        className="no-print bb-date-icon"
      >
        <Calendar size={14} />
      </button>
      {editing ? (
        <input
          ref={inputRef}
          type="date"
          value={value || ''}
          min={min || undefined}
          max={max || undefined}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur(); }}
          aria-label={label}
          className="bb-date"
        />
      ) : (
        <button type="button" className="bb-date-text" onClick={() => setEditing(true)} aria-label={`${label}: ${display(value) || 'not set'}. Click to type`}>
          {display(value) || <span className="bb-date-empty">Pick date</span>}
        </button>
      )}
      {open && pos && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label={`Choose ${label}`}
          className="no-print fixed z-[200] bg-paper border border-bb2 rounded-[12px] shadow-[0_8px_24px_rgba(15,28,46,.12)] p-3 animate-fade-in"
          style={{ top: pos.top, left: pos.left, width: CAL_W }}
        >
          <RangeCalendar
            mode="single"
            from={value}
            to={value}
            min={min}
            max={max}
            onChange={({ from }) => { onChange(from); setOpen(false); btnRef.current?.focus(); }}
          />
        </div>,
        document.body
      )}
    </span>
  );
};
