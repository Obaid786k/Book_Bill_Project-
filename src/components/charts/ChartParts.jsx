import React from 'react';
import { clsx } from 'clsx';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { tooltipBoxClass, SERIES, inr } from './chartTheme';


// Same card for every chart: title (+ small sub), right-side controls, chart, optional insight line.
export const ChartCard = ({ title, sub, actions, children, insight, insightIcon: InsightIcon, insightTone = 'navy', className }) => (
  <section className={clsx('bg-paper border border-bb2 rounded-[12px] px-[18px] py-4 min-w-0', className)} aria-label={typeof title === 'string' ? title : undefined}>
    {(title || actions) && (
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-navy">{title}</h2>
          {sub && <div className="text-[12px] text-ink2 mt-0.5">{sub}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    )}
    {children}
    {insight && (
      <div className="mt-4 pt-3 border-t border-bb2 flex items-start gap-2.5">
        {InsightIcon && <InsightIcon size={16} className={clsx('mt-0.5 shrink-0', { navy: 'text-navy', green: 'text-green', red: 'text-red', gold: 'text-gold' }[insightTone])} />}
        <p className="text-[13px] text-ink leading-relaxed">{insight}</p>
      </div>
    )}
  </section>
);

// Generic tooltip: label + one row per series with its colour.
export const ChartTooltip = ({ active, payload, label, format = inr }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={tooltipBoxClass}>
      {label != null && <p className="font-semibold text-ink mb-1">{label}</p>}
      {payload.filter((p) => p.value != null).map((p) => (
        <p key={p.dataKey ?? p.name} className="flex items-center gap-2 text-ink">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color || p.payload?.fill }} />
          {p.name}
          <b className="ml-auto pl-3 tabular-nums">{format(p.value)}</b>
        </p>
      ))}
    </div>
  );
};

// Segmented + SeriesToggle live in common/Segmented (shared with New Bill, no chart code there).
export { Segmented, SeriesToggle } from '../common/Segmented';

// Donut with total in the middle and a legend list (GST split, payment status, categories ...).
// compact: always side by side, no % column (small dashboard cards).
export const DonutChart = ({ data, format = inr, centerLabel = 'Total', height = 220, colors = SERIES, compact = false }) => {
  const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0);
  return (
    <div className={clsx('flex items-center', compact ? 'flex-row gap-3' : 'flex-col sm:flex-row gap-4')}>
      <div className={clsx('relative', compact ? 'w-[45%] shrink-0' : 'w-full sm:w-1/2')} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="90%" paddingAngle={2} stroke="none">
              {data.map((d, i) => <Cell key={d.name} fill={colors[i % colors.length]} />)}
            </Pie>
            <Tooltip content={<ChartTooltip format={format} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] text-ink2">{centerLabel}</span>
          <span className={clsx('font-bold text-navy-900 tabular-nums', compact ? 'text-[13px]' : 'text-[16px]')}>{format(total)}</span>
        </div>
      </div>
      <ul className={clsx('flex flex-col gap-2 min-w-0', compact ? 'flex-1' : 'w-full sm:w-1/2')}>
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2 text-[13px]">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: colors[i % colors.length] }} />
            <span className="text-ink2 truncate">{d.name}</span>
            <span className="ml-auto font-semibold text-navy-900 tabular-nums">{format(d.value)}</span>
            {!compact && <span className="w-10 text-right text-[11px] text-ink2 tabular-nums">{total ? Math.round((d.value / total) * 100) : 0}%</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};
