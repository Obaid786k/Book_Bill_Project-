import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { insightsService } from '../../services/insightsService';
import { Loader2, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#0A2540', '#0077C8', '#40E0D0'];

export const GST = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    insightsService.getGSTAnalytics().then(setData);
  }, []);

  if (!data) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-navy" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-ink">GST Analytics</h1>
        <p className="text-sm text-ink2 mt-1">Track your tax liability and collection breakdown.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Tax Collected" value={`₹${data.totalTax.toLocaleString()}`} subtitle="Year to date" />
        <StatCard title="CGST Total" value={`₹${data.breakdown.find(d => d.name === 'CGST')?.value.toLocaleString()}`} />
        <StatCard title="SGST Total" value={`₹${data.breakdown.find(d => d.name === 'SGST')?.value.toLocaleString()}`} />
        <StatCard title="IGST Total" value={`₹${data.breakdown.find(d => d.name === 'IGST')?.value.toLocaleString()}`} />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-navy mb-6">Tax Breakdown</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.breakdown} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                  {data.breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 pt-4 border-t border-bb2 flex items-start gap-3 text-red">
            <TrendingDown size={18} className="mt-0.5 shrink-0" />
            <p className="text-[13.5px] text-ink font-medium leading-relaxed">
              <strong>IGST</strong> collections have dropped by 15% this quarter, indicating fewer inter-state sales. Consider running targeted promotions in neighboring states.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-navy mb-6">Tax Collection Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTax} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(value) => `₹${value}`} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', fontSize: '13px' }} formatter={(val) => `₹${val}`} />
                <Line type="monotone" dataKey="tax" name="Total GST" stroke="#0077C8" strokeWidth={3} dot={{ r: 4, fill: '#0077C8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GST;
