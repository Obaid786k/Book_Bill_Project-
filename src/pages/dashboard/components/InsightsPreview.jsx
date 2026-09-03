import React from 'react';
import { Card } from '../../../components/common/Card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const InsightsPreview = ({ data }) => {
  if (!data) return null;

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-5 flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-navy-lt/30">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-[15px] font-bold text-navy">Revenue Trend</h3>
            <p className="text-[12px] text-ink2 mt-1">
              <strong>Observation:</strong> Revenue peaked on Friday (₹24,500). Consider sending weekend promos.
            </p>
          </div>
        </div>
        <div className="flex-1 min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.revenueTrend} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A2540" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#0A2540" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#0F172A', fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ color: '#64748B', fontSize: '11px', marginBottom: '4px' }}
                formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#0A2540" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5 flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-navy-lt/30">
        <h3 className="text-[15px] font-bold text-navy mb-1">Top Products</h3>
        <p className="text-[12px] text-ink2 mb-5">
          <strong>Observation:</strong> 'Website Design' drives 50%+ of sales.
        </p>
        
        <div className="flex flex-col gap-4 flex-1">
          {data.topProducts.map((product, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-bg flex items-center justify-center font-bold text-navy text-[12px]">
                  {idx + 1}
                </div>
                <span className="text-[13px] font-semibold text-navy">{product.name}</span>
              </div>
              <span className="text-[13px] font-mono font-medium text-ink2">₹{product.sales.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
