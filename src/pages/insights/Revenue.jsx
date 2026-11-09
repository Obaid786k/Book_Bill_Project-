import React, { useState, useEffect } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { ChartCard, ChartTooltip, Segmented, SeriesToggle } from '../../components/charts/ChartParts';
import { CHART, axisProps, gridProps, barRadius, barCursor, inrCompact, inr } from '../../components/charts/chartTheme';
import { insightsService } from '../../services/insightsService';

const PERIODS = [{ value: 6, label: '6M' }, { value: 12, label: '12M' }];

export const Revenue = () => {
  const [data, setData] = useState(null);
  const [months, setMonths] = useState(12);
  const [show, setShow] = useState({ revenue: true, gst: true });

  useEffect(() => {
    insightsService.getRevenueAnalytics().then(setData);
  }, []);

  if (!data) return <div><PageHeader /><div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-navy" /></div></div>;

  const points = data.monthlyTrend.slice(-months);
  const toggle = (key) => (on) => {
    const next = { ...show, [key]: on };
    if (!next.revenue && !next.gst) return; // keep at least one series visible
    setShow(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader className="!mb-1" />

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <StatCard title="Total revenue" value={inr(data.total)} subtitle="This financial year (incl. GST)" />
        <StatCard
          title="Growth vs last year"
          value={data.growth == null ? '—' : `${data.growth >= 0 ? '+' : ''}${data.growth}%`}
          subtitle={data.growth == null ? 'No bills in the same period last year' : 'Same period last financial year'}
          subClass={data.growth == null ? 'text-ink2' : data.growth >= 0 ? 'text-green' : 'text-red'}
        />
      </div>

      <ChartCard
        title="Revenue and GST"
        sub="Monthly, last 12 months"
        actions={
          <>
            <div className="flex items-center gap-1">
              <SeriesToggle checked={show.revenue} onChange={toggle('revenue')} label="Revenue" swatch={CHART.current} />
              <SeriesToggle checked={show.gst} onChange={toggle('gst')} label="GST" swatch={CHART.accent} />
            </div>
            <Segmented label="Period" options={PERIODS} value={months} onChange={setMonths} />
          </>
        }
        insight={data.bestMonth ? `Best month so far: ${data.bestMonth.name.trim()} with ${inr(data.bestMonth.revenue)} from ${data.bestMonth.bills} bill${data.bestMonth.bills === 1 ? '' : 's'}.` : 'Your monthly revenue appears here after your first bill.'}
        insightIcon={TrendingUp}
        insightTone="green"
      >
        <div style={{ height: CHART.height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} width={48} tickFormatter={inrCompact} />
              <Tooltip content={<ChartTooltip />} cursor={barCursor} />
              {show.revenue && <Bar dataKey="revenue" name="Revenue" fill={CHART.current} radius={barRadius} maxBarSize={36} />}
              {show.gst && <Line type="monotone" dataKey="gst" name="GST" stroke={CHART.accent} strokeWidth={2.5} dot={{ r: 3, fill: CHART.accent }} activeDot={{ r: 5 }} />}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
};

export default Revenue;
