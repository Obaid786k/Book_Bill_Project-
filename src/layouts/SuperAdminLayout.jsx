import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/common/Button';
import { Server, Users, Database, HardDrive, Activity, ScrollText, DatabaseBackup, LogOut, LayoutDashboard, ToggleRight, ArrowLeft } from 'lucide-react';
import { ComingSoonBadge } from '../components/common/ComingSoonBadge';
import { clsx } from 'clsx';

const AdminNavLink = ({ to, icon: Icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) => clsx(
      "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-all duration-200",
      isActive ? "bg-white/10 text-white font-semibold shadow-sm" : "font-medium text-white/60 hover:bg-white/5 hover:text-white"
    )}
  >
    {({ isActive }) => (
      <>
        <Icon size={16} className={isActive ? 'text-white' : 'text-white/60'} />
        <span>{children}</span>
      </>
    )}
  </NavLink>
);

export const SuperAdminLayout = () => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState(new Date());

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 600);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-bg overflow-hidden font-body">
      {/* Super Admin Dark Sidebar */}
      <div className="w-64 bg-navy-dk text-white flex flex-col shrink-0 overflow-y-auto hidden md:flex border-r border-navy-lt/20">
        <div className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Server className="text-gold" size={24} />
            <h1 className="text-lg font-display font-bold text-white tracking-wide">Platform Console</h1>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-green animate-pulse"></div>
            <span className="text-xs text-white/70 font-medium">System Online</span>
          </div>
        </div>
        

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 mb-2 mt-4">Dashboard</div>
          <AdminNavLink to="/admin/dashboard" icon={LayoutDashboard}>Platform Health</AdminNavLink>
          
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 mb-2 mt-5">Monitoring</div>
          <AdminNavLink to="/admin/users" icon={Users}>User Statistics</AdminNavLink>
          <AdminNavLink to="/admin/database" icon={Database}>Database Health</AdminNavLink>
          <AdminNavLink to="/admin/storage" icon={HardDrive}>Storage Usage</AdminNavLink>
          <AdminNavLink to="/admin/performance" icon={Activity}>Performance</AdminNavLink>

          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 mb-2 mt-5">System Operations</div>
          <AdminNavLink to="/admin/logs" icon={ScrollText}>System Logs</AdminNavLink>
          <AdminNavLink to="/admin/backups" icon={DatabaseBackup}>Backup Status</AdminNavLink>
          
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 mb-2 mt-5">Configuration</div>
          <AdminNavLink to="/admin/flags" icon={ToggleRight}>
            Feature Flags <ComingSoonBadge className="ml-auto scale-90" />
          </AdminNavLink>
        </nav>
        
        <div className="p-4 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-navy font-bold text-xs">
              SA
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-white truncate">{user?.email}</p>
              <p className="text-[10px] text-white/50">Super Administrator</p>
            </div>
          </div>
          <Button 
            variant="toolbar-ghost"
            onClick={handleLogout}
            className="w-full justify-center text-[12.5px]"
          >
            <LogOut size={14} /> Exit Console
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-bg text-ink overflow-y-auto">
        {/* Super Admin Topbar */}
        <div className="h-[50px] bg-navy-dk text-paper flex items-center justify-end px-6 sticky top-0 z-20 border-b border-white/10">
          <Button 
            variant="primary"
            size="default"
            onClick={() => navigate('/dashboard')}
            className="shadow-sm text-sm"
          >
            <ArrowLeft size={16} /> Exit to App
          </Button>
        </div>
        {/* System Health Summary Bar */}
        <div className="bg-navy-dk/5 border-b border-bb2 px-6 py-2 flex items-center justify-between text-xs font-mono sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green"></span>
              </span>
              <span className="font-bold text-green uppercase tracking-widest text-[10px]">All Systems Operational</span>
            </div>
            <span className="text-ink3">|</span>
            <span className="text-ink2">Active Nodes: 12</span>
            <span className="text-ink3">|</span>
            <span className="text-ink2">Uptime: 99.99%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-ink3">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button 
              onClick={handleRefresh}
              className={clsx(
                "p-1 rounded text-navy-lt hover:bg-navy-lt/10 transition-colors",
                isRefreshing && "animate-spin"
              )}
              title="Refresh Telemetry"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
          </div>
        </div>

        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
