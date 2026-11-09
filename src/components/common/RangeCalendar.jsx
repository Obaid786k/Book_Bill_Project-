import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { localDateStr, parseLocalDate, isValidDateStr } from '../../utils/date';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-1';

// Monday-first grid of the month (leading blanks = null).
const monthGrid = (year, month) => {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells = Array(lead).fill(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  return cells;
};

// The app's one calendar (Dashboard range, New Bill dates).
// mode 'range': click a start date, then an end date (`active` says which end the next click sets).
// mode 'single': one click picks the date (onChange gets { from: d, to: d }).
// from / to / min / max are 'YYYY-MM-DD'; max = '' means no upper limit.
export const RangeCalendar = ({ from, to, onChange, max = localDateStr(), min = '', active = 'from', onActiveChange, mode = 'range' }) => {
  const anchor = isValidDateStr(to) ? parseLocalDate(to) : isValidDateStr(from) ? parseLocalDate(from) : max ? parseLocalDate(max) : new Date();
  const [view, setView] = useState({ y: anchor.getFullYear(), m: anchor.getMonth() });
  const maxD = max ? parseLocalDate(max) : null;
  const minD = min ? parseLocalDate(min) : null;
  const canNext = !maxD || view.y * 12 + view.m < maxD.getFullYear() * 12 + maxD.getMonth();

  const shift = (n) => setView(({ y, m }) => {
    const t = y * 12 + m + n;
    return { y: Math.floor(t / 12), m: t % 12 };
  });

  const pick = (d) => {
    const s = localDateStr(d);
    if (mode === 'single') {
      onChange({ from: s, to: s });
      return;
    }
    if (active === 'from' || !from) {
      onChange({ from: s, to: '' });
      onActiveChange?.('to');
      return;
    }
    // Second click: end date (if earlier than start, swap).
    if (s < from) onChange({ from: s, to: from });
    else onChange({ from, to: s });
    onActiveChange?.('from');
  };

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={() => shift(-1)} aria-label="Previous month"
          className={clsx('w-8 h-8 rounded-lg flex items-center justify-center text-ink2 hover:bg-navy/[.06]', FOCUS)}>
          <ChevronLeft size={16} />
        </button>
        <span className="text-[13px] font-bold text-navy-900">{MONTHS[view.m]} {view.y}</span>
        <button type="button" onClick={() => shift(1)} disabled={!canNext} aria-label="Next month"
          className={clsx('w-8 h-8 rounded-lg flex items-center justify-center text-ink2 hover:bg-navy/[.06] disabled:opacity-30 disabled:hover:bg-transparent', FOCUS)}>
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-ink3 mb-1">
        {WEEK.map((w) => <span key={w} className="h-6 leading-6">{w}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5" role="grid">
        {monthGrid(view.y, view.m).map((d, i) => {
          if (!d) return <span key={`b${i}`} />;
          const s = localDateStr(d);
          const disabled = (maxD && d > maxD) || (minD && d < minD);
          const isStart = s === from;
          const isEnd = s === to;
          const inRange = from && to && s > from && s < to;
          const isToday = s === localDateStr();
          return (
            <div key={s} className={clsx('h-9 flex items-center justify-center',
              inRange && 'bg-navy/[.08]',
              isStart && to && to !== from && 'bg-gradient-to-r from-transparent from-50% to-navy/[.08] to-50%',
              isEnd && from && to !== from && 'bg-gradient-to-l from-transparent from-50% to-navy/[.08] to-50%')}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => pick(d)}
                aria-pressed={isStart || isEnd}
                aria-label={d.toDateString()}
                className={clsx('w-9 h-9 rounded-full text-[13px] tabular-nums transition-colors', FOCUS,
                  isStart || isEnd ? 'bg-navy text-white font-bold'
                    : disabled ? 'text-ink3/50 cursor-not-allowed'
                      : clsx('text-ink hover:bg-navy/[.10]', isToday && 'font-bold text-navy ring-1 ring-inset ring-navy-300'))}
              >
                {d.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
