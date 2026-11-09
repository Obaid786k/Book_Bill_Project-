import React from 'react';
import { clsx } from 'clsx';

// One number card for the whole app (Dashboard, Insights, Bill History, Account ...).
// trend accepts: 'up' | 'down' (+ trendValue), a number (%), or { isPositive, value }.
const readTrend = (trend, trendValue) => {
  if (trend == null || trend === false) return null;
  if (typeof trend === 'object') return { up: !!trend.isPositive, text: trend.value };
  if (typeof trend === 'number') return { up: trend >= 0, text: `${Math.abs(trend)}%` };
  if (trend === 'up' || trend === 'down') return trendValue ? { up: trend === 'up', text: trendValue } : null;
  return null;
};

export const StatCard = ({ title, value, subtitle, subClass = 'text-ink2', icon: Icon, trend, trendValue, className, compact = false }) => {
  const t = readTrend(trend, trendValue);
  return (
    <div
      className={clsx(
        'bg-paper border border-bb2 border-t-[3px] border-t-navy rounded-[12px] flex flex-col min-w-0',
        compact ? 'px-4 pt-3 pb-3.5' : 'px-[18px] pt-[14px] pb-4',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12.5px] font-medium text-ink2">{title}</p>
        {Icon && <Icon size={16} className="text-nav-icon shrink-0" />}
      </div>
      <p className={clsx('font-bold text-navy-900 tabular-nums leading-tight mt-1 truncate', compact ? 'text-[22px]' : 'text-[28px]')}>
        {value}
      </p>
      {(t || subtitle) && (
        <p className="text-[12px] mt-1 flex flex-wrap items-center gap-x-1.5">
          {t && <span className={clsx('font-semibold', t.up ? 'text-green' : 'text-red')}>{t.up ? '↑' : '↓'} {t.text}</span>}
          {subtitle && <span className={subClass}>{subtitle}</span>}
        </p>
      )}
    </div>
  );
};
