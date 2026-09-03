import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Users, CreditCard } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const UserStatistics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminService.getUserStatistics().then(setData);
  }, []);

  if (!data) return <div className="p-8">Loading stats...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-ink">User Statistics</h1>
        <p className="text-sm text-ink2 mt-1">Platform adoption and signup metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard 
          compact
          title="Total Registered Users" 
          value={data.totalUsers.toLocaleString()}
          icon={Users}
        />
        <StatCard 
          compact
          title="Active Subscriptions" 
          value={data.activeSubscriptions.toLocaleString()}
          icon={CreditCard}
        />
      </div>

      <Card className="p-6">
        <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-6 pb-2 border-b border-bb2">
          New Signups (Last 7 Days)
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.signupTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--navy)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--navy)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#0F172A', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="signups" 
                stroke="var(--navy)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorSignups)" 
                name="New Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default UserStatistics;
