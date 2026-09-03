import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import { Server, Users, Activity, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PlatformDashboard = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    adminService.getPlatformDashboard().then(setData);
  }, []);

  if (!data) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-ink">Platform Health</h1>
        <p className="text-sm text-ink2 mt-1">High-level overview of the entire infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => navigate('/admin/logs')} className="cursor-pointer group">
          <StatCard 
            compact
            title="System Status" 
            value={data.systemStatus}
            icon={Server}
            className="border-l-4 border-l-green group-hover:border-navy-lt/30 transition-colors"
          />
        </div>
        
        <div onClick={() => navigate('/admin/users')} className="cursor-pointer group">
          <StatCard 
            compact
            title="Total Tenants" 
            value={data.totalTenants.toLocaleString()}
            icon={Users}
            className="group-hover:border-navy-lt/30 transition-colors"
          />
        </div>
        
        <div onClick={() => navigate('/admin/performance')} className="cursor-pointer group">
          <StatCard 
            compact
            title="API Uptime (30d)" 
            value={data.apiUptime}
            icon={Activity}
            className="group-hover:border-navy-lt/30 transition-colors"
          />
        </div>
        
        <div onClick={() => navigate('/admin/logs')} className="cursor-pointer group">
          <StatCard 
            compact
            title="Active Incidents" 
            value={data.activeIncidents}
            icon={AlertTriangle}
            className={data.activeIncidents > 0 ? "border-l-4 border-l-red group-hover:border-navy-lt/30 transition-colors" : "group-hover:border-navy-lt/30 transition-colors"}
          />
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;
