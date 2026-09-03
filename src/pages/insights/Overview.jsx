import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { insightsService } from '../../services/insightsService';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insightsService.getOverview().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) {
    const pulse = "animate-pulse bg-bb2 rounded";
    return (
      <div>
        <div className="mb-6">
          <div className={`${pulse} h-8 w-48 mb-2`}></div>
          <div className={`${pulse} h-4 w-72`}></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-5 flex flex-col h-[110px]">
              <div className={`${pulse} h-3 w-1/2 mb-4`}></div>
              <div className={`${pulse} h-6 w-3/4 mb-2`}></div>
              <div className={`${pulse} h-2 w-1/3 mt-auto`}></div>
            </Card>
          ))}
        </div>
        <Card className="p-6 mb-6">
          <div className={`${pulse} h-5 w-48 mb-4`}></div>
          <div className={`${pulse} h-64 w-full`}></div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Executive Overview</h1>
          <p className="text-sm text-ink2 mt-1">High-level summary of your business performance this month.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Revenue" value={`₹${data.totalRevenue.toLocaleString()}`} subtitle="vs last month" trend={data.revenueGrowth >= 0 ? 'up' : 'down'} trendValue={`${Math.abs(data.revenueGrowth)}%`} />
        <StatCard title="Bills Generated" value={data.billsGenerated} subtitle="vs last month" trend={data.billsGrowth >= 0 ? 'up' : 'down'} trendValue={`${Math.abs(data.billsGrowth)}%`} />
        <StatCard title="Avg Bill Value" value={`₹${data.avgBillValue.toLocaleString()}`} subtitle="vs last month" trend={data.avgBillGrowth >= 0 ? 'up' : 'down'} trendValue={`${Math.abs(data.avgBillGrowth)}%`} />
        <StatCard title="Outstanding" value={`₹${data.outstanding.toLocaleString()}`} subtitle="vs last month" trend={data.outstandingGrowth >= 0 ? 'up' : 'down'} trendValue={`${Math.abs(data.outstandingGrowth)}%`} />
      </div>

      <Card className="p-6 mb-6">
        <h3 className="text-lg font-bold text-navy mb-4">7-Day Revenue Trend</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A2540" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0A2540" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(value) => `₹${value}`} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', fontSize: '13px' }} formatter={(val) => `₹${val}`} />
              <Area type="monotone" dataKey="value" stroke="#0A2540" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 pt-4 border-t border-bb2 flex items-start gap-3 text-green">
          <TrendingUp size={18} className="mt-0.5 shrink-0" />
          <p className="text-[13.5px] text-ink font-medium leading-relaxed">
            Revenue peaked on <strong>Sunday</strong> at ₹3,490. Weekends consistently drive 45% of your total weekly revenue.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Overview;
