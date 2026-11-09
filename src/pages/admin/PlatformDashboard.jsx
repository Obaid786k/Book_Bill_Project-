import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, Users, Activity, AlertTriangle, FileText, Package, UserPlus, UserCheck } from 'lucide-react';
import { adminService, runningFor } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import { useAdminData } from './useAdminData';
import { AdminError, AdminHeader } from './AdminParts';

const fmt = (v) => Number(v || 0).toLocaleString('en-IN');

export const PlatformDashboard = () => {
  const { data, error } = useAdminData(adminService.getPlatformDashboard);
  const navigate = useNavigate();

  if (error) return <AdminError message={error} />;
  if (!data) return <div className="p-8">Loading dashboard...</div>;

  const card = (to, props) => (
    <div onClick={() => navigate(to)} className="cursor-pointer group">
      <StatCard compact {...props} className={`group-hover:border-navy-lt/30 transition-colors ${props.className || ''}`} />
    </div>
  );

  return (
    <div>
      <AdminHeader title="Platform Health" description="Live overview of all businesses and the database." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {card('/admin/logs', {
          title: 'System Status',
          value: 'Operational',
          subtitle: 'Database is answering',
          icon: Server,
          className: 'border-l-4 border-l-green',
        })}
        {card('/admin/users', {
          title: 'Total Tenants',
          value: fmt(data.totalTenants),
          subtitle: `${fmt(data.setupDone)} finished setup`,
          icon: Users,
        })}
        {card('/admin/database', {
          title: 'Database running for',
          value: runningFor(data.dbStartedAt),
          subtitle: 'Since last restart',
          icon: Activity,
        })}
        {card('/admin/logs', {
          title: 'Errors (24h)',
          value: fmt(data.errors24h),
          subtitle: data.errors24h ? 'See System Logs' : 'No app errors',
          icon: AlertTriangle,
          className: data.errors24h > 0 ? 'border-l-4 border-l-red' : '',
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {card('/admin/users', {
          title: 'Registered users',
          value: fmt(data.totalUsers),
          subtitle: `${fmt(data.signups7d)} new in 7 days`,
          icon: UserPlus,
        })}
        {card('/admin/users', {
          title: 'Active users (24h)',
          value: fmt(data.activeUsers24h),
          subtitle: `${fmt(data.activeUsers7d)} in the last 7 days`,
          icon: UserCheck,
        })}
        <StatCard compact title="Bills" value={fmt(data.totalBills)} subtitle={`${fmt(data.billsToday)} today · ${fmt(data.cancelledBills)} cancelled`} icon={FileText} />
        <StatCard compact title="Products" value={fmt(data.totalProducts)} subtitle={`${fmt(data.totalDrafts)} drafts · ${fmt(data.customTemplates)} own templates`} icon={Package} />
      </div>
    </div>
  );
};

export default PlatformDashboard;
