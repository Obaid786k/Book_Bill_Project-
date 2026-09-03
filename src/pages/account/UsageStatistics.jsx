import React, { useState, useEffect } from 'react';
import { accountService } from '../../services/accountService';
import { Card } from '../../components/common/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const UsageStatistics = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    accountService.getUsageStatistics().then(setData);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-ink">Usage Statistics</h1>
        <p className="text-sm text-ink2 mt-1">System activity and logins over the last 7 days.</p>
      </div>

      <Card className="p-6">
        <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-6 pb-2 border-b border-bb2">
          System Actions
        </h2>
        
        <div className="h-[300px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A2540" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0A2540" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748B' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748B' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0F172A', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="actions" 
                  stroke="#0A2540" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorActions)" 
                  name="Actions Performed"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-ink2">Loading chart...</div>
          )}
        </div>
      </Card>
      
      <Card className="p-6 mt-6">
        <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-6 pb-2 border-b border-bb2">
          Weekly Logins
        </h2>
        <div className="flex gap-2">
          {data.map((day, idx) => (
            <div key={idx} className="flex-1 bg-row-alt rounded p-3 text-center">
              <p className="text-xs text-ink2 mb-1">{day.name}</p>
              <p className="text-lg font-bold text-navy">{day.logins}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default UsageStatistics;
