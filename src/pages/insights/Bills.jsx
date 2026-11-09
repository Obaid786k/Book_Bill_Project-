import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, Info } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { ChartCard, ChartTooltip } from '../../components/charts/ChartParts';
import { CHART, axisProps, gridProps, barRadius, barCursor, inr, num } from '../../components/charts/chartTheme';
import { insightsService } from '../../services/insightsService';

export const Bills = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    insightsService.getBillAnalytics().then(setData);
  }, []);

  if (!data) return <div><PageHeader /><div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-navy" /></div></div>;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader className="!mb-1" />

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard title="Total invoices" value={num(data.totalBills)} subtitle="This financial year" />
        <StatCard title="Average value" value={inr(data.averageValue)} subtitle="Per invoice" />
        <StatCard title="Largest bill" value={inr(data.largestBill)} subtitle="This financial year" />
        <StatCard title="Avg items" value={data.avgItems} subtitle="Per invoice" />
      </div>

      <ChartCard
        title="Invoice volume"
        sub="Last 8 weeks (week starting)"
        insight={data.busiestWeek ? `Busiest week: starting ${data.busiestWeek.name}, with ${data.busiestWeek.bills} bill${data.busiestWeek.bills === 1 ? '' : 's'}.` : 'Bill counts appear here after your first bill.'}
        insightIcon={Info}
      >
        <div style={{ height: CHART.height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.volumeTrend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} allowDecimals={false} />
              <Tooltip content={<ChartTooltip format={num} />} cursor={barCursor} />
              <Bar dataKey="bills" name="Bills" fill={CHART.current} radius={barRadius} maxBarSize={56} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
};

export default Bills;
