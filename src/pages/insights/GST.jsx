import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, Info } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { ChartCard, ChartTooltip, DonutChart } from '../../components/charts/ChartParts';
import { CHART, axisProps, gridProps, lineCursor, inrCompact, inr } from '../../components/charts/chartTheme';
import { insightsService } from '../../services/insightsService';

export const GST = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    insightsService.getGSTAnalytics().then(setData);
  }, []);

  if (!data) return <div><PageHeader /><div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-navy" /></div></div>;

  const part = (name) => data.breakdown.find((d) => d.name === name)?.value || 0;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader className="!mb-1" />

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard title="Total tax collected" value={inr(data.totalTax)} subtitle="This financial year" />
        <StatCard title="CGST" value={inr(part('CGST'))} subtitle="Central tax" />
        <StatCard title="SGST" value={inr(part('SGST'))} subtitle="State tax" />
        <StatCard title="IGST" value={inr(part('IGST'))} subtitle="Inter-state tax" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard
          title="Tax breakdown"
          sub="This financial year"
          insight={data.totalTax > 0
            ? `IGST (other-state sales) is ${Math.round((part('IGST') / data.totalTax) * 100)}% of your GST this year.`
            : 'Your GST split appears here after your first GST bill.'}
          insightIcon={Info}
          insightTone="navy"
        >
          {data.totalTax > 0
            ? <DonutChart data={data.breakdown} centerLabel="Total GST" />
            : <div className="h-[220px] flex items-center justify-center text-[13px] text-ink2">No GST collected yet this year</div>}
        </ChartCard>

        <ChartCard title="Tax collection trend" sub="Monthly, this financial year">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTax} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis {...axisProps} width={48} tickFormatter={inrCompact} />
                <Tooltip content={<ChartTooltip />} cursor={lineCursor} />
                <Line type="monotone" dataKey="tax" name="Total GST" stroke={CHART.current} strokeWidth={2.5} dot={{ r: 3, fill: CHART.current }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default GST;
