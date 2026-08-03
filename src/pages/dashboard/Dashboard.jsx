import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';
import { shopService } from '../../services/shopService';
import { BusinessHealth } from './components/BusinessHealth';
import { QuickActions } from './components/QuickActions';
import { RecentActivity } from './components/RecentActivity';
import { InsightsPreview } from './components/InsightsPreview';
import { AccountInfo } from './components/AccountInfo';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { mockDashboardData } from '../../services/dashboardService';

const Dashboard = ({ isPreview = false }) => {
  const { data: fetchedData, isLoading, isError } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: dashboardService.getDashboardData,
  });

  const data = isPreview ? mockDashboardData : fetchedData;
  const { user } = useAuthStore();
  
  const [showReminder, setShowReminder] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const name = user?.fullName || user?.name;
  const greeting = name ? `${getGreeting()}, ${name}!` : 'Welcome back!';

  useEffect(() => {
    if (isPreview) return;
    shopService.getProfile().then(p => {
      const incomplete = !p.shopName || !p.shopGstin || !p.shopAddress;
      const hidden = sessionStorage.getItem('hideProfileReminder') === 'true';
      if (incomplete && !hidden) {
        setShowReminder(true);
      }
    });
  }, [isPreview]);

  const dismissReminder = () => {
    sessionStorage.setItem('hideProfileReminder', 'true');
    setShowReminder(false);
  };

  if (isLoading && !isPreview) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-red-bg border border-red rounded-lg mt-4">
        <h2 className="text-red font-bold">Failed to load dashboard</h2>
        <p className="text-sm text-red/80 mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto animation-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">{greeting}</h1>
          <p className="text-[13px] text-ink2 mt-1">Here's what's happening with your business today.</p>
        </div>
        <QuickActions />
      </div>

      {!isPreview && showReminder && (
        <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-gold text-lg">⚠️</span>
            <p className="text-[13px] text-navy font-medium">Complete your business profile with GST details for fully compliant invoices.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/settings/profile" className="text-[12.5px] font-bold text-navy hover:underline whitespace-nowrap">Complete Profile</Link>
            <button onClick={dismissReminder} className="text-ink3 hover:text-ink transition-colors font-bold text-lg leading-none" title="Dismiss for now">×</button>
          </div>
        </div>
      )}

      <BusinessHealth data={data.health} />
      
      <RecentActivity data={data.recentActivity} />
      
      <InsightsPreview data={data.insights} />
      
      <AccountInfo data={data.account} />
    </div>
  );
};

export default Dashboard;
