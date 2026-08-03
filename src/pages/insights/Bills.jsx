import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { insightsService } from '../../services/insightsService';
import { Loader2, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Bills = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    insightsService.getBillAnalytics().then(setData);
  }, []);

  if (!data) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-navy" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-ink">Bill Analytics</h1>
        <p className="text-sm text-ink2 mt-1">Analyze invoice volume and average order values.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Invoices" value={data.totalBills} subtitle="Year to date" />
        <StatCard title="Average Value" value={`₹${data.averageValue.toLocaleString()}`} subtitle="Per invoice" />
        <StatCard title="Largest Bill" value={`₹${data.largestBill.toLocaleString()}`} subtitle="All time" />
        <StatCard title="Avg Items" value={data.avgItems} subtitle="Per invoice" />
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-navy mb-6">Invoice Volume (This Month)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.volumeTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
              <Bar dataKey="bills" name="Bills Generated" fill="#0A2540" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 pt-4 border-t border-bb2 flex items-start gap-3 text-navy">
          <Info size={18} className="mt-0.5 shrink-0" />
          <p className="text-[13.5px] text-ink font-medium leading-relaxed">
            Bill volume spikes significantly during <strong>Week 4</strong> of every month. Consider staffing up during month-end to reduce customer wait times.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Bills;
