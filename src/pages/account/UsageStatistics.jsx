import React, { useState, useEffect, useId } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageHeader } from '../../components/common/PageHeader';
import { ChartCard, ChartTooltip } from '../../components/charts/ChartParts';
import { CHART, axisProps, gridProps, lineCursor, num } from '../../components/charts/chartTheme';
import { accountService } from '../../services/accountService';

export const UsageStatistics = () => {
  const [data, setData] = useState([]);
  const gradId = useId().replace(/:/g, '');

  useEffect(() => {
    accountService.getUsageStatistics().then(setData);
  }, []);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4">
      <PageHeader className="!mb-1" />

      <ChartCard title="Recorded actions" sub="Last 7 days · bills saved, status changes, settings changes">
        <div style={{ height: CHART.height }}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART.current} stopOpacity={0.24} />
                    <stop offset="100%" stopColor={CHART.current} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis {...axisProps} allowDecimals={false} />
                <Tooltip content={<ChartTooltip format={num} />} cursor={lineCursor} />
                <Area type="monotone" dataKey="actions" name="Actions" stroke={CHART.current} strokeWidth={2.5} fill={`url(#${gradId})`} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[13px] text-ink2">Loading chart...</div>
          )}
        </div>
      </ChartCard>

      <ChartCard title="Bills created" sub="Last 7 days">
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {data.map((day) => (
            <div key={day.name} className="bg-row-alt rounded-lg p-3 text-center">
              <p className="text-[11px] text-ink2 mb-1">{day.name}</p>
              <p className="text-[18px] font-bold text-navy-900 tabular-nums">{day.bills}</p>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
};

export default UsageStatistics;
