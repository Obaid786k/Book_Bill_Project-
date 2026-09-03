import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { insightsService } from '../../services/insightsService';
import { Loader2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Payments = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    insightsService.getPaymentAnalytics().then(setData);
  }, []);

  if (!data) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-navy" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-ink">Payment Analytics</h1>
        <p className="text-sm text-ink2 mt-1">Monitor your collections and outstanding dues.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Collected" value={`₹${data.totalCollected.toLocaleString()}`} subtitle="Year to date" />
        <Card className="p-6 bg-red/10 border-none">
          <h3 className="text-sm font-bold text-red uppercase tracking-wider mb-2">Total Outstanding</h3>
          <p className="text-3xl font-display font-bold text-navy">₹{data.outstanding.toLocaleString()}</p>
        </Card>
        <StatCard title="Collection Rate" value={`${data.collectionRate}%`} subtitle="Of total billed amount" />
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-navy mb-6">Payment Status Breakdown</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.statusBreakdown} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#111827' }} width={80} />
              <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
              <Bar dataKey="value" fill="#0A2540" radius={[0, 4, 4, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 pt-4 border-t border-bb2 flex items-start gap-3 text-red">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p className="text-[13.5px] text-ink font-medium leading-relaxed">
            You have <strong>120 pending invoices</strong>. Your collection rate dropped slightly this month. Consider sending automated payment reminders to clients with partial payments.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Payments;
