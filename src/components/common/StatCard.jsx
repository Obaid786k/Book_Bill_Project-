import React from 'react';
import { Card } from './Card';
import { clsx } from 'clsx';

export const StatCard = ({ title, value, icon: Icon, trend, className, compact = false }) => {
  return (
    <Card className={clsx(compact ? "p-4" : "p-5", "flex flex-col", className)}>
      <div className={clsx("flex items-start justify-between", compact ? "mb-2" : "mb-3")}>
        <h3 className="text-ink3 font-bold text-[11px] uppercase tracking-[0.5px]">{title}</h3>
        {Icon && <Icon size={compact ? 14 : 16} className="text-navy-lt opacity-70" />}
      </div>
      <div className={clsx("font-bold text-navy tracking-tight font-mono", compact ? "text-[20px]" : "text-[22px]")}>
        {value}
      </div>
      {trend && (
        <div className={clsx("text-[11.5px] mt-2 font-medium flex items-center gap-1", trend.isPositive ? "text-green" : "text-red")}>
          <span>{trend.isPositive ? "↑" : "↓"}</span>
          <span>{trend.value}</span>
        </div>
      )}
    </Card>
  );
};
