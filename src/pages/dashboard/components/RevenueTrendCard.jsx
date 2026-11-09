import React, { useId, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Clock, Check, CalendarRange } from 'lucide-react';
import { clsx } from 'clsx';
import { Popover } from '../../../components/common/Popover';
import { RangeCalendar } from '../../../components/common/RangeCalendar';
import { Button } from '../../../components/common/Button';
import { ChartCard, ChartTooltip, Segmented, SeriesToggle } from '../../../components/charts/ChartParts';
import { dashboardService } from '../../../services/dashboardService';
import { sampleService } from '../../../services/sampleData'; // marketing preview only
import { CHART, axisProps, gridProps, lineCursor, inrCompact, inr } from '../../../components/charts/chartTheme';
import { localDateStr, parseLocalDate, addDays, diffDays, isValidDateStr } from '../../../utils/date';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2';
const MAX_SPAN_DAYS = 366 * 3;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const today = () => parseLocalDate(localDateStr());
const ds = (d) => localDateStr(d);

const PRESETS = {
  '7d': { label: '7D', range: () => [addDays(today(), -6), today()], granularity: 'day' },
  '30d': { label: '30D', range: () => [addDays(today(), -29), today()], granularity: 'day' },
  '12m': { label: '12M', range: () => { const t = today(); return [new Date(t.getFullYear(), t.getMonth() - 11, 1), t]; }, granularity: 'month' },
};

const fyStartYear = (d) => (d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1);

const QUICK_PICKS = [
  { label: 'This month', range: () => { const t = today(); return [new Date(t.getFullYear(), t.getMonth(), 1), t]; } },
  { label: 'Last month', range: () => { const t = today(); return [new Date(t.getFullYear(), t.getMonth() - 1, 1), new Date(t.getFullYear(), t.getMonth(), 0)]; } },
  { label: 'This quarter', range: () => { const t = today(); return [new Date(t.getFullYear(), Math.floor(t.getMonth() / 3) * 3, 1), t]; } },
  { label: 'Last 90 days', range: () => [addDays(today(), -89), today()] },
  { label: 'This FY (Apr–Mar)', range: () => [new Date(fyStartYear(today()), 3, 1), today()] },
  { label: 'Last FY', range: () => { const y = fyStartYear(today()) - 1; return [new Date(y, 3, 1), new Date(y + 1, 2, 31)]; } },
];

const matchQuickPick = (from, to) =>
  QUICK_PICKS.find((q) => { const [a, b] = q.range(); return ds(a) === from && ds(b) === to; })?.label ?? null;

const autoGranularity = (from, to) => {
  const days = diffDays(from, to) + 1;
  if (days <= 31) return 'day';
  if (days <= 120) return 'week';
  return 'month';
};

const validate = (fromStr, toStr) => {
  if (!isValidDateStr(fromStr) || !isValidDateStr(toStr)) return 'Pick both dates.';
  const f = parseLocalDate(fromStr);
  const t = parseLocalDate(toStr);
  if (t < f) return '"To" must be on or after "From".';
  if (t > today()) return '"To" cannot be after today.';
  if (diffDays(f, t) + 1 > MAX_SPAN_DAYS) return 'Pick a range of 3 years or less.';
  return '';
};

// Range lives in the URL (?range=7d | ?from=&to=, ?compare=0) so it survives refresh.
const useRange = () => {
  const [params, setParams] = useSearchParams();
  const compare = params.get('compare') !== '0';
  const from = params.get('from');
  const to = params.get('to');
  const update = (next) => setParams(next, { replace: true });
  if (from && to && !validate(from, to)) {
    return { key: 'custom', from, to, granularity: autoGranularity(parseLocalDate(from), parseLocalDate(to)), compare, update, params };
  }
  const key = PRESETS[params.get('range')] ? params.get('range') : '30d';
  const [f, t] = PRESETS[key].range();
  return { key, from: ds(f), to: ds(t), granularity: PRESETS[key].granularity, compare, update, params };
};

const fmtShort = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
const rangeLabel = (from, to, withYear = true) => {
  const f = parseLocalDate(from);
  const t = parseLocalDate(to);
  if (!withYear) return `${fmtShort(f)} – ${fmtShort(t)}`;
  return f.getFullYear() === t.getFullYear()
    ? `${fmtShort(f)} – ${fmtShort(t)} ${t.getFullYear()}`
    : `${fmtShort(f)} ${f.getFullYear()} – ${fmtShort(t)} ${t.getFullYear()}`;
};

const fmtFull = (str) => {
  if (!isValidDateStr(str)) return null;
  const d = parseLocalDate(str);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const CustomRangePopover = ({ onClose, anchorRef, range }) => {
  const [from, setFrom] = useState(range.from);
  const [to, setTo] = useState(range.to);
  const [activeEnd, setActiveEnd] = useState('from');
  const [compare, setCompare] = useState(range.compare);
  const [picked, setPicked] = useState(() => (range.key === 'custom' ? matchQuickPick(range.from, range.to) : null));
  const max = localDateStr();
  const liveErr = to ? validate(from, to) : '';
  const days = !to || liveErr ? 0 : diffDays(parseLocalDate(from), parseLocalDate(to)) + 1;

  const apply = () => {
    if (!to || liveErr) return;
    const next = { from, to };
    if (!compare) next.compare = '0';
    range.update(next);
    onClose();
  };

  return (
    <Popover isOpen onClose={onClose} anchorRef={anchorRef} label="Custom date range"
      className="absolute right-0 top-[calc(100%+6px)] w-[580px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-140px)] overflow-y-auto">
      <div className="sm:grid sm:grid-cols-[168px_1fr]">
        {/* Quick picks */}
        <div className="p-3 border-b sm:border-b-0 sm:border-r border-bb2">
          <p className="text-[11px] font-semibold text-ink2 tracking-wide mb-1.5 px-1">QUICK PICK</p>
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
            {QUICK_PICKS.map((q) => {
              const on = picked === q.label;
              return (
                <button
                  key={q.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => { const [a, b] = q.range(); setFrom(ds(a)); setTo(ds(b)); setPicked(q.label); setActiveEnd('from'); }}
                  className={clsx('h-9 px-2.5 rounded-lg text-left text-[13px] flex items-center justify-between gap-1 transition-colors', FOCUS,
                    on ? 'bg-navy text-white font-semibold' : 'text-ink font-medium hover:bg-navy/[.06]')}
                >
                  {q.label}
                  {on && <Check size={14} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Calendar */}
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[['from', 'From', from], ['to', 'To', to]].map(([key, label, val]) => (
              <button
                key={key}
                type="button"
                aria-pressed={activeEnd === key}
                onClick={() => setActiveEnd(key)}
                className={clsx('h-11 px-2.5 rounded-lg border text-left bg-paper transition-colors', FOCUS,
                  activeEnd === key ? 'border-navy ring-2 ring-navy/15' : 'border-bb hover:border-navy-300')}
              >
                <span className="block text-[10.5px] font-semibold text-ink2 uppercase tracking-wide">{label}</span>
                <span className={clsx('block text-[13px] font-semibold', val ? 'text-ink' : 'text-ink3')}>{fmtFull(val) || 'Pick a date'}</span>
              </button>
            ))}
          </div>

          <RangeCalendar
            key={picked || 'manual'}
            from={from}
            to={to}
            max={max}
            active={activeEnd}
            onActiveChange={setActiveEnd}
            onChange={(r) => { setFrom(r.from); setTo(r.to); setPicked(null); }}
          />

          <div className={clsx('mt-3 flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12.5px]',
            liveErr ? 'bg-red-bg text-red' : 'bg-navy/[.06] text-navy')}>
            <CalendarRange size={15} className="shrink-0" />
            {liveErr
              ? <span role="alert">{liveErr}</span>
              : !to
                ? <span>Now pick the end date</span>
                : <span><b>{rangeLabel(from, to)}</b> · {days} day{days === 1 ? '' : 's'}</span>}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 border-t border-bb2">
        <label className="flex items-center gap-2 text-[12.5px] text-ink cursor-pointer">
          <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} className="accent-navy w-4 h-4" />
          Compare with previous period
        </label>
        <div className="flex gap-2 ml-auto">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="navy" onClick={apply} disabled={!to || !!liveErr}>Apply</Button>
        </div>
      </div>
    </Popover>
  );
};

// sample: marketing home preview (no logged-in user) — shows demo numbers.
export const RevenueTrendCard = ({ className, sample = false }) => {
  const range = useRange();
  const gradId = useId().replace(/:/g, '');
  const customRef = useRef(null);
  const [customOpen, setCustomOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ['revenueTrend', sample, range.from, range.to, range.granularity, range.compare],
    queryFn: () => (sample ? sampleService : dashboardService).getRevenueTrend(range),
    placeholderData: keepPreviousData,
  });

  const choosePreset = (key) => {
    const next = { range: key };
    if (!range.compare) next.compare = '0';
    range.update(next);
  };

  const setCompare = (on) => {
    const next = Object.fromEntries(range.params);
    if (on) delete next.compare; else next.compare = '0';
    range.update(next);
  };

  const points = data?.points || [];
  const isEmpty = data && points.every((p) => !p.value);
  const up = (data?.changePct ?? 0) >= 0;
  const isCustom = range.key === 'custom';

  return (
    <ChartCard
      className={className}
      title={<>Revenue trend <span className="text-[12px] font-normal text-ink2">· {rangeLabel(range.from, range.to)}</span></>}
      sub={
        <div className="flex flex-wrap items-baseline gap-x-2 mt-0.5">
          <span className="text-[26px] font-bold text-navy-900 tabular-nums">{data ? inr(data.total) : '—'}</span>
          {range.compare && data?.changePct != null && (
            <span className={clsx('text-[12px] font-semibold', up ? 'text-green' : 'text-red')}>
              {up ? '+' : '−'}{Math.abs(data.changePct).toFixed(1)}% vs previous period
            </span>
          )}
        </div>
      }
      actions={
        <>
          <div className="flex items-center gap-1">
            <span className="hidden sm:inline-flex items-center gap-1.5 h-7 px-2 text-[12px] font-medium text-ink">
              <span className="w-[14px] h-[3px] rounded" style={{ background: CHART.current }} />This period
            </span>
            <SeriesToggle checked={range.compare} onChange={setCompare} label="Compare" swatch={CHART.previous} dashed />
          </div>
          <div className="relative">
            <Segmented
              label="Date range"
              value={range.key}
              onChange={choosePreset}
              options={Object.entries(PRESETS).map(([value, p]) => ({ value, label: p.label }))}
            >
              <button
                ref={customRef}
                type="button"
                aria-pressed={isCustom}
                aria-expanded={customOpen}
                aria-haspopup="dialog"
                onClick={() => setCustomOpen((o) => !o)}
                className={clsx('h-7 px-3 rounded-md text-[12px] font-semibold flex items-center gap-1.5 transition-colors', FOCUS,
                  isCustom ? 'bg-navy text-white shadow-sm' : customOpen ? 'bg-paper text-navy shadow-sm' : 'text-ink2 hover:text-navy hover:bg-paper')}
              >
                <Clock size={13} /> {isCustom ? rangeLabel(range.from, range.to, false) : 'Custom'}
              </button>
            </Segmented>
            {customOpen && <CustomRangePopover onClose={() => setCustomOpen(false)} anchorRef={customRef} range={range} />}
          </div>
        </>
      }
    >
      <div style={{ height: CHART.height }}>
        {isEmpty ? (
          <div className="h-full flex items-center justify-center text-[13px] text-ink2">Your revenue trend appears after your first bill</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.current} stopOpacity={0.24} />
                  <stop offset="100%" stopColor={CHART.current} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} interval={Math.max(0, Math.ceil(points.length / 6) - 1)} />
              <YAxis {...axisProps} width={48} tickFormatter={inrCompact} />
              <Tooltip content={<ChartTooltip />} cursor={lineCursor} />
              <Area name="This period" type="monotone" dataKey="value" stroke={CHART.current} strokeWidth={2.5} fill={`url(#${gradId})`} dot={false} activeDot={{ r: 4 }} />
              {range.compare && (
                <Line name="Previous period" type="monotone" dataKey="prevValue" stroke={CHART.previous} strokeWidth={1.5} strokeDasharray="4 4" dot={false} activeDot={false} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
};
