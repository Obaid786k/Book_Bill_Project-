import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';

import { accountService, formatBytes } from '../../services/accountService';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Database, FileText, Package, LayoutTemplate, Clock, ShieldCheck, Monitor, Smartphone } from 'lucide-react';
import { ComingSoonBadge } from '../../components/common/ComingSoonBadge';
import { ComingSoonPanel } from '../../components/common/ComingSoonPanel';
import { Dialog } from '../../components/common/Dialog';
import { Skeleton } from '../../components/feedback/Skeleton';

export const AccountOverview = () => {
  const [data, setData] = useState(null);
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  useEffect(() => {
    accountService.getOverview().then(setData);
  }, []);

  if (!data) return (
    <div className="max-w-5xl mx-auto">
      <PageHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6"><Skeleton className="h-4 w-32 mb-4" /><Skeleton className="h-16" /></Card>
        <Card className="p-6"><Skeleton className="h-4 w-32 mb-4" /><Skeleton className="h-16" /></Card>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Data stored"
          value={formatBytes(data.storageUsedBytes)}
          subtitle="Approx. size of your bills, products and drafts"
          icon={Database}
        />
        <StatCard 
          title="Total Bills" 
          value={data.billsCount} 
          subtitle="All bills, including cancelled"
          icon={FileText}
        />
        <StatCard 
          title="Total Products" 
          value={data.productCount} 
          subtitle="Items in your catalogue"
          icon={Package}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-4 pb-2 border-b border-bb2">
            System Entities
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-navy-lt/10 flex items-center justify-center text-navy">
                  <FileText size={16} />
                </div>
                <span className="text-sm font-medium text-ink">Active Drafts</span>
              </div>
              <span className="text-sm font-bold text-navy">{data.draftCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gold/10 flex items-center justify-center text-gold">
                  <LayoutTemplate size={16} />
                </div>
                <span className="text-sm font-medium text-ink">Invoice Templates</span>
              </div>
              <span className="text-sm font-bold text-navy">{data.templateCount}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-4 pb-2 border-b border-bb2">
            Account Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-green/10 flex items-center justify-center text-green">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-xs text-ink2">Account</p>
                <p className="text-sm font-bold text-navy">{data.accountStatus}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-navy-lt/10 flex items-center justify-center text-navy">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-xs text-ink2">Last Login</p>
                <p className="text-sm font-bold text-navy">{data.lastLogin}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Future Scope Placeholders */}
      <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-4 mt-8 pb-2 border-b border-bb2">
        Device & Security Controls
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className="p-6 cursor-pointer hover:border-navy-lt/30 transition-colors group"
          onClick={() => setShowPlaceholder(true)}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-navy/5 text-navy flex items-center justify-center shrink-0">
              <Monitor size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy group-hover:text-gold-dk transition-colors">
                Active Sessions <ComingSoonBadge />
              </h3>
              <p className="text-[13px] text-ink2 mt-1">View and manage all active web sessions across your devices.</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:border-navy-lt/30 transition-colors group"
          onClick={() => setShowPlaceholder(true)}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-navy/5 text-navy flex items-center justify-center shrink-0">
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy group-hover:text-gold-dk transition-colors">
                Connected Devices <ComingSoonBadge />
              </h3>
              <p className="text-[13px] text-ink2 mt-1">Manage POS terminals, mobile apps, and trusted devices linked to your account.</p>
            </div>
          </div>
        </Card>
      </div>

      <Dialog
        isOpen={showPlaceholder}
        onClose={() => setShowPlaceholder(false)}
        title="Device Management"
      >
        <ComingSoonPanel
          title="Device Management"
          description="Soon you'll have full visibility and control over where your account is logged in, allowing remote logout."
          onDismiss={() => setShowPlaceholder(false)}
        />
      </Dialog>
    </div>
  );
};

export default AccountOverview;
