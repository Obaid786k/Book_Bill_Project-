import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import { billService } from '../services/billService';
import { shopService } from '../services/shopService';
import { useAuthStore } from '../store/authStore';
import { localDateStr } from '../utils/date';

// Shared query keys — call queryClient.invalidateQueries({ queryKey: ALERT_KEYS.drafts })
// after a change so the bell, the drafts badge and the dashboard refresh.
export const ALERT_KEYS = {
  bills: ['alerts', 'bills'],
  drafts: ['alerts', 'drafts'],
  profile: ['alerts', 'profile'],
};

const READ_KEY = 'bb_read_alerts';
const loadRead = () => {
  try { return JSON.parse(localStorage.getItem(READ_KEY) || '[]'); } catch { return []; }
};
const saveRead = (ids) => {
  try { localStorage.setItem(READ_KEY, JSON.stringify(ids.slice(-200))); } catch { /* ignore */ }
};

// Which alerts the user has already seen (per browser).
export const useAlertReadStore = create((set, get) => ({
  readIds: loadRead(),
  markRead: (ids) => {
    const next = Array.from(new Set([...get().readIds, ...ids]));
    saveRead(next);
    set({ readIds: next });
  },
}));

const enabledFor = (businessId) => ({ enabled: !!businessId, staleTime: 30_000 });

// Drafts list (also feeds the sidebar badge).
export const useDraftsQuery = () => {
  const businessId = useAuthStore((s) => s.user?.businessId);
  return useQuery({ queryKey: ALERT_KEYS.drafts, queryFn: billService.getDrafts, ...enabledFor(businessId) });
};

// Days between two local YYYY-MM-DD dates.
const daysBetween = (from, to) => {
  const [y1, m1, d1] = from.split('-').map(Number);
  const [y2, m2, d2] = to.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
};

const inr = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`;

// Real alerts built from existing data (no new tables).
// Each alert: { id, type, text, sub, link, linkLabel }
export const useAlerts = () => {
  const businessId = useAuthStore((s) => s.user?.businessId);
  const bills = useQuery({ queryKey: ALERT_KEYS.bills, queryFn: billService.listBills, ...enabledFor(businessId) });
  const drafts = useDraftsQuery();
  const profile = useQuery({ queryKey: ALERT_KEYS.profile, queryFn: shopService.getProfile, ...enabledFor(businessId) });
  const readIds = useAlertReadStore((s) => s.readIds);

  const alerts = useMemo(() => {
    const out = [];
    const today = localDateStr();

    (bills.data || [])
      .filter((b) => b.status === 'Pending' && b.meta?.dueDate && b.meta.dueDate < today)
      .sort((a, b) => (b.meta.dueDate > a.meta.dueDate ? 1 : -1))
      .slice(0, 5)
      .forEach((b) => {
        const days = daysBetween(b.meta.dueDate, today);
        out.push({
          id: `overdue-${b.id}`,
          type: 'overdue',
          text: `${b.meta.invoiceNo} is ${days} day${days === 1 ? '' : 's'} overdue`,
          sub: `${b.customer?.custName || 'Customer'} · ${inr(b.totals?.grand)} pending`,
          link: '/billing/history',
          linkLabel: 'View',
        });
      });

    const draftCount = drafts.data?.length || 0;
    if (draftCount > 0) {
      out.push({
        id: `drafts-${draftCount}`,
        type: 'drafts',
        text: `${draftCount} draft${draftCount === 1 ? '' : 's'} not finished`,
        sub: 'Open one to finish and print it',
        link: '/billing/drafts',
        linkLabel: 'Open',
      });
    }

    const p = profile.data;
    if (p) {
      if (!p.shopName || !p.shopAddress) {
        out.push({
          id: 'profile-basics',
          type: 'profile',
          text: !p.shopName ? 'Business name missing from profile' : 'Business address missing from profile',
          sub: 'Shown at the top of every invoice',
          link: '/settings/profile',
          linkLabel: 'Add',
        });
      }
      if (!p.shopGstin && p.defaultTaxType !== 'none') {
        out.push({
          id: 'profile-gstin',
          type: 'profile',
          text: 'GSTIN missing from profile',
          sub: 'Needed for valid B2B tax invoices',
          link: '/settings/profile',
          linkLabel: 'Add',
        });
      }
    }
    return out.map((a) => ({ ...a, unread: !readIds.includes(a.id) }));
  }, [bills.data, drafts.data, profile.data, readIds]);

  return {
    alerts,
    unreadCount: alerts.filter((a) => a.unread).length,
    isLoading: bills.isLoading || drafts.isLoading || profile.isLoading,
    shopProfile: profile.data,
  };
};
