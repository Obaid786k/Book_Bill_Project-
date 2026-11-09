import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { ChartCard, ChartTooltip } from '../../components/charts/ChartParts';
import { CHART, axisProps, gridPropsVertical, barRadiusH, barCursor, inr, num } from '../../components/charts/chartTheme';
import { insightsService } from '../../services/insightsService';

// Horizontal bars by status — also used on the Dashboard.
export const PaymentStatusChart = ({ data, height = CHART.height }) => (
  <div style={{ height }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid {...gridPropsVertical} />
        <XAxis type="number" {...axisProps} allowDecimals={false} />
        <YAxis dataKey="name" type="category" {...axisProps} tick={{ ...axisProps.tick, fontSize: 12, fill: '#0F1C2E' }} width={72} />
        <Tooltip content={<ChartTooltip format={num} />} cursor={barCursor} />
        <Bar dataKey="value" name="Invoices" fill={CHART.current} radius={barRadiusH} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const Payments = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    insightsService.getPaymentAnalytics().then(setData);
  }, []);

  if (!data) return <div><PageHeader /><div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-navy" /></div></div>;


  return (
    <div className="flex flex-col gap-4">
      <PageHeader className="!mb-1" />

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <StatCard title="Total collected" value={inr(data.totalCollected)} subtitle="Paid bills, this financial year" />
        <StatCard title="Total outstanding" value={inr(data.outstanding)} subtitle="Still to be collected" subClass="text-red" />
        <StatCard title="Collection rate" value={`${data.collectionRate}%`} subtitle="Of amount billed this financial year" />
      </div>

      <ChartCard
        title="Payment status breakdown"
        sub="Invoices by status"
        insight={data.pendingCount
          ? `${num(data.pendingCount)} invoice${data.pendingCount === 1 ? ' is' : 's are'} still pending${data.overdueCount ? `, ${num(data.overdueCount)} of them overdue` : ''}. Follow up from Bill History.`
          : 'All bills are paid. Nothing to collect.'}
        insightIcon={AlertCircle}
        insightTone="red"
      >
        <PaymentStatusChart data={data.statusBreakdown} />
      </ChartCard>
    </div>
  );
};

export default Payments;
