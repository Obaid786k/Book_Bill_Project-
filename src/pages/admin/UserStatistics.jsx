import React from 'react';
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Users, Store, UserCheck, CalendarCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART, axisProps, gridProps, lineCursor, num } from '../../components/charts/chartTheme';
import { ChartTooltip } from '../../components/charts/ChartParts';
import { useAdminData } from './useAdminData';
import { AdminError, AdminHeader } from './AdminParts';

const fmt = (v) => Number(v || 0).toLocaleString('en-IN');

export const UserStatistics = () => {
  const { data, error } = useAdminData(adminService.getUserStatistics);

  if (error) return <AdminError message={error} />;
  if (!data) return <div className="p-8">Loading stats...</div>;

  return (
    <div>
      <AdminHeader title="User Statistics" description="Platform adoption and sign-up numbers, live from the database." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard compact title="Total Registered Users" value={fmt(data.totalUsers)} subtitle={`${fmt(data.verifiedUsers)} email verified`} icon={Users} />
        <StatCard compact title="Businesses" value={fmt(data.totalTenants)} subtitle={`${fmt(data.setupDone)} finished setup`} icon={Store} />
        <StatCard compact title="Active (24h)" value={fmt(data.activeUsers24h)} subtitle="Signed in today" icon={UserCheck} />
        <StatCard compact title="Active (7 days)" value={fmt(data.activeUsers7d)} subtitle="Signed in this week" icon={CalendarCheck} />
      </div>

      <Card className="p-6">
        <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-6 pb-2 border-b border-bb2">
          New Signups (Last 7 Days) · {fmt(data.signups7d)}
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
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} allowDecimals={false} />
              <Tooltip content={<ChartTooltip format={num} />} cursor={lineCursor} />
              <Area
                type="monotone"
                dataKey="signups"
                stroke={CHART.current}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorSignups)"
                name="New users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default UserStatistics;
