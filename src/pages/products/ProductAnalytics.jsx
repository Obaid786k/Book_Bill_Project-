import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Info, Loader2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { ChartCard, ChartTooltip, DonutChart } from '../../components/charts/ChartParts';
import { CHART, axisProps, gridPropsVertical, barRadiusH, barCursor, num, inr } from '../../components/charts/chartTheme';
import { insightsService } from '../../services/insightsService';

// Horizontal bars — also used on the Dashboard overview.
export const TopSellingChart = ({ data, height = 240 }) => (
  <div style={{ height }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid {...gridPropsVertical} />
        <XAxis type="number" {...axisProps} />
        <YAxis dataKey="name" type="category" {...axisProps} tick={{ ...axisProps.tick, fill: '#0F1C2E' }} width={128} />
        <Tooltip content={<ChartTooltip format={num} />} cursor={barCursor} />
        <Bar dataKey="sales" name="Units sold" fill={CHART.current} radius={barRadiusH} maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const ProductAnalytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    insightsService.getProductAnalytics().then(setData);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader className="!mb-1" />

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard title="Total products" value={data ? num(data.totalProducts) : '—'} subtitle="In your catalogue" />
        <StatCard title="Active categories" value={data ? num(data.activeCategories) : '—'} subtitle="Used by your products" />
        <StatCard title="Average price" value={data ? inr(data.averagePrice) : '—'} subtitle="Across catalogue" />
        <StatCard title="Highest price" value={data ? inr(data.highestPrice) : '—'} subtitle={data?.highestName || '—'} />
      </div>

      {!data ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-navy" /></div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          <ChartCard
            title="Top selling items"
            sub="By units sold (last 30 days)"
            insight={data.topSelling[0]
              ? <><strong>{data.topSelling[0].name}</strong> sold the most units in the last 30 days.</>
              : 'Your best sellers appear here after your first bill.'}
            insightIcon={TrendingUp}
            insightTone="green"
          >
            {data.topSelling.length
              ? <TopSellingChart data={data.topSelling} />
              : <div className="h-[240px] flex items-center justify-center text-[13px] text-ink2">No items sold in the last 30 days</div>}
          </ChartCard>

          <ChartCard
            title="Revenue by category"
            sub="Last 30 days, before discount and tax adjustments"
            insight={data.revenueByCategory[0]
              ? <><strong>{data.revenueByCategory[0].name}</strong> brings the most revenue. Items not found in your catalogue are grouped as "Not in catalogue".</>
              : 'The category split appears here after your first bill.'}
            insightIcon={Info}
            insightTone="gold"
          >
            {data.revenueByCategory.length
              ? <DonutChart data={data.revenueByCategory} centerLabel="Revenue" height={240} />
              : <div className="h-[240px] flex items-center justify-center text-[13px] text-ink2">No sales in the last 30 days</div>}
          </ChartCard>
        </div>
      )}

      {data && data.totalProducts > 0 && data.slowMoving.length > 0 && (
        <Card className="p-5 bg-row-alt border-dashed">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red/10 text-red flex items-center justify-center shrink-0">
              <TrendingDown size={20} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-navy mb-1.5">Not sold in the last 30 days</h3>
              <p className="text-[13.5px] text-ink2 leading-relaxed mb-3">
                <strong>{data.slowMoving.slice(0, 5).join(', ')}</strong>
                {data.slowMoving.length > 5 ? ` and ${data.slowMoving.length - 5} more` : ''} had no sales in the last 30 days.
              </p>
              <div className="bg-white border border-bb2 p-3.5 rounded-lg">
                <span className="text-[11px] font-bold uppercase tracking-wider text-navy-lt mb-1 block">Suggestion</span>
                <p className="text-[13px] text-ink">Check their price, keep them visible near the counter, or remove items you no longer sell.</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProductAnalytics;
