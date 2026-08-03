import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { insightsService } from '../../services/insightsService';
import { Loader2, TrendingUp } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const Revenue = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    insightsService.getRevenueAnalytics().then(setData);
  }, []);

  if (!data) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-navy" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-ink">Revenue Analytics</h1>
        <p className="text-sm text-ink2 mt-1">Track your income and profit trends over time.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card className="p-6 bg-gold-bg border-none">
          <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-2">Total Revenue (YTD)</h3>
          <p className="text-3xl font-display font-bold text-navy">₹{data.total.toLocaleString()}</p>
        </Card>
        <Card className="p-6 bg-green/10 border-none">
          <h3 className="text-sm font-bold text-green uppercase tracking-wider mb-2">Year-over-Year Growth</h3>
          <p className="text-3xl font-display font-bold text-navy">+{data.growth}%</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-navy mb-6">Revenue vs Profit (Monthly)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.monthlyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(value) => `₹${value/1000}k`} />
              <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', fontSize: '13px' }} formatter={(val) => `₹${val.toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="revenue" name="Gross Revenue" fill="#0A2540" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#FBBF24" strokeWidth={3} dot={{ r: 4, fill: '#FBBF24' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 pt-4 border-t border-bb2 flex items-start gap-3 text-gold">
          <TrendingUp size={18} className="mt-0.5 shrink-0" />
          <p className="text-[13.5px] text-ink font-medium leading-relaxed">
            Revenue shows strong seasonality, peaking in <strong>December</strong>. Profit margins remain stable at roughly 65% across all months.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Revenue;
