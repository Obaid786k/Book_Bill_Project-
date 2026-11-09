import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Store, Package, Plus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { dashboardService } from '../../services/dashboardService';
import { mockDashboardData, sampleOverview } from '../../services/sampleData'; // marketing preview only
import { useAlerts } from '../../hooks/useAlerts';
import { useGuardedNavigate } from '../../hooks/useGuardedNavigate';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatCard } from '../../components/common/StatCard';
import { ChartCard, DonutChart } from '../../components/charts/ChartParts';
import { insightsService } from '../../services/insightsService';
import { TopSellingChart } from '../products/ProductAnalytics';
import { PaymentStatusChart } from '../insights/Payments';
import { AlertList } from '../../components/shell/AlertList';
import { inr } from '../../components/charts/chartTheme';
import { RevenueTrendCard } from './components/RevenueTrendCard';
import { DashboardSkeleton } from './components/DashboardSkeleton';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const todayLabel = () => {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

// Shown on the marketing preview (no logged-in user).
const SAMPLE_ALERTS = [
  { id: 's1', type: 'overdue', text: 'INV-0012 is 7 days overdue', link: '/billing/history', linkLabel: 'View' },
  { id: 's2', type: 'drafts', text: '3 drafts not finished', link: '/billing/drafts', linkLabel: 'Open' },
  { id: 's3', type: 'profile', text: 'GSTIN missing from profile', link: '/settings/profile', linkLabel: 'Add' },
];

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Small "View" link in a card header.
const CardLink = ({ onClick, children = 'View' }) => (
  <button type="button" onClick={onClick} className="text-[13px] font-semibold text-ink hover:text-navy rounded px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2">
    {children}
  </button>
);

// Bottom "Business overview" row — the same sample sources Insights uses.
const useOverview = (isPreview) => {
  const opts = { enabled: !isPreview };
  const gst = useQuery({ queryKey: ['insights', 'gst'], queryFn: insightsService.getGSTAnalytics, ...opts });
  const products = useQuery({ queryKey: ['insights', 'products'], queryFn: insightsService.getProductAnalytics, ...opts });
  const payments = useQuery({ queryKey: ['insights', 'payments'], queryFn: insightsService.getPaymentAnalytics, ...opts });
  if (isPreview) return sampleOverview;
  return { gst: gst.data, products: products.data, payments: payments.data };
};

const Dashboard = ({ isPreview = false }) => {
  const user = useAuthStore((s) => s.user);
  const { go } = useGuardedNavigate();
  const { alerts, shopProfile } = useAlerts();
  const { data: fetched, isLoading, isError } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: dashboardService.getDashboardData,
    enabled: !isPreview,
  });
  const data = isPreview ? mockDashboardData : fetched;
  const overview = useOverview(isPreview);

  if (isLoading && !isPreview) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <div className="p-8 text-center bg-red-bg border border-red rounded-lg mt-4">
        <h2 className="text-red font-bold">Failed to load dashboard</h2>
        <p className="text-sm text-red/80 mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  const h = data.health;
  const shopName = isPreview ? 'Your business name' : shopProfile?.shopName;
  const name = isPreview ? 'Sam' : user?.name;

  const eyebrow = (
    <span className="flex flex-wrap items-center gap-1.5 text-[13px]">
      <Store size={16} className="text-navy shrink-0" />
      {shopName
        ? <span className="font-bold text-navy">{shopName}</span>
        : <Link to="/settings/profile" className="font-bold text-navy underline underline-offset-2">Add your business name</Link>}
      <span className="text-ink2 font-normal">· {todayLabel()}</span>
    </span>
  );

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <PageHeader
        showBack={false}
        className="!mb-1"
        eyebrow={eyebrow}
        title={name ? `${greeting()}, ${name}` : greeting()}
        actions={
          <>
            {data.isSample && (
              <span className="text-[11px] font-semibold bg-bb2 text-ink2 rounded-full px-2.5 py-1">Sample data</span>
            )}
            <Button variant="outline" className="h-10 px-4 text-[13px]" onClick={() => go('/products', { state: { openNew: true } })}>
              <Package size={16} /> Add product
            </Button>
            <Button variant="primary" className="h-10 px-4 text-[13px]" onClick={() => go('/billing/new')}>
              <Plus size={16} /> New bill
            </Button>
          </>
        }
      />

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard title="Today's sales" value={inr(h.todayRevenue)} subtitle={`${plural(h.billsToday, 'bill')} today`} />
        <StatCard title="This month" value={inr(h.monthRevenue)} subtitle={plural(h.monthBills, 'bill')} />
        <StatCard title="Outstanding" value={inr(h.outstandingAmount)} subtitle={`${plural(h.pendingCount, 'invoice')} pending`} subClass="text-gold" />
        <StatCard title="Overdue" value={inr(h.overdueAmount)} subtitle={`${plural(h.overdueCount, 'invoice')} past due date`} subClass="text-red" />
      </div>

      <RevenueTrendCard sample={isPreview} />

      <div className="flex flex-wrap gap-4">
        <section className="flex-[2_1_420px] min-w-0 bg-paper border border-bb2 rounded-[12px] overflow-hidden" aria-label="Recent invoices">
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
            <h2 className="text-[15px] font-bold text-navy">Recent invoices</h2>
            <CardLink onClick={() => go('/billing/history')}>View all</CardLink>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-[13px]">
              <tbody className="divide-y divide-bb2 border-t border-bb2">
                {data.recentBills.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-[13px] text-ink2">
                      No bills yet. <button type="button" onClick={() => go('/billing/new')} className="font-semibold text-navy underline underline-offset-2">Create your first bill</button>
                    </td>
                  </tr>
                )}
                {data.recentBills.map((b) => (
                  <tr key={b.id} className="hover:bg-row-alt transition-colors">
                    <td className="px-4 py-3 font-semibold text-navy whitespace-nowrap">{b.invoiceNo || b.id}</td>
                    <td className="px-4 py-3 text-ink2 truncate max-w-[200px]">{b.customer}</td>
                    <td className="px-4 py-3 text-right font-bold text-navy-900 tabular-nums whitespace-nowrap">{inr(b.amount)}</td>
                    <td className="px-4 py-3 w-[90px]"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex-[1_1_300px] min-w-0 bg-paper border border-bb2 rounded-[12px] px-4 pt-3.5 pb-2" aria-label="Needs your attention">
          <h2 className="text-[15px] font-bold text-navy mb-1">Needs your attention</h2>
          <AlertList alerts={isPreview ? SAMPLE_ALERTS : alerts} variant="compact" />
        </section>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <ChartCard title="GST collected" sub="This financial year" actions={<CardLink onClick={() => go('/insights/gst')} />}>
          {!overview.gst ? <div className="h-[170px]" />
            : overview.gst.breakdown.some((x) => x.value > 0)
              ? <DonutChart data={overview.gst.breakdown} centerLabel="Total GST" height={170} compact />
              : <div className="h-[170px] flex items-center justify-center text-center text-[13px] text-ink2 px-4">No GST collected yet this year</div>}
        </ChartCard>
        <ChartCard title="Top selling items" sub="Last 30 days" actions={<CardLink onClick={() => go('/products/analytics')} />}>
          {!overview.products ? <div className="h-[170px]" />
            : overview.products.topSelling.length
              ? <TopSellingChart data={overview.products.topSelling} height={170} />
              : <div className="h-[170px] flex items-center justify-center text-center text-[13px] text-ink2 px-4">No items sold in the last 30 days</div>}
        </ChartCard>
        <ChartCard title="Payment status" sub="Invoices by status" actions={<CardLink onClick={() => go('/insights/payments')} />}>
          {overview.payments && overview.payments.statusBreakdown.every((x) => !x.value)
            ? <div className="h-[170px] flex items-center justify-center text-center text-[13px] text-ink2 px-4">No bills yet</div>
            : overview.payments
            ? <PaymentStatusChart data={overview.payments.statusBreakdown} height={170} />
            : <div className="h-[170px]" />}
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;
