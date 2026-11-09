// Account pages from REAL data: your bills, products, drafts, templates, activity log and login.
// Nothing here is invented — things the app cannot know (IP, location, plan limits) are not shown.
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { billService } from './billService';
import { productService } from './productService';
import { localDateStr, addDays, parseLocalDate } from '../utils/date';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const businessId = () => useAuthStore.getState().user?.businessId;
const safe = (p, fallback) => p.catch(() => fallback);
// Rough size of stored rows (what the database keeps for you), in bytes.
const sizeOf = (list) => new Blob([JSON.stringify(list || [])]).size;

const loadAll = async () => {
  const [bills, products, drafts, templates] = await Promise.all([
    safe(billService.listBills(), []),
    safe(productService.getProducts(), []),
    safe(billService.getDrafts(), []),
    safe(billService.getTemplates(), []),
  ]);
  return { bills, products, drafts, templates: templates.filter((t) => !t.seeded) };
};

const fmtDateTime = (iso) => (iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

// "Chrome on Windows" from the browser's own description.
const deviceName = () => {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'this device';
  return `${browser} on ${os}`;
};

export const accountService = {
  getOverview: async () => {
    const [{ bills, products, drafts, templates }, { data: auth }] = await Promise.all([loadAll(), supabase.auth.getUser()]);
    return {
      storageUsedBytes: sizeOf(bills) + sizeOf(products) + sizeOf(drafts) + sizeOf(templates),
      billsCount: bills.length,
      productCount: products.length,
      draftCount: drafts.length,
      templateCount: templates.length,
      lastLogin: fmtDateTime(auth?.user?.last_sign_in_at),
      accountStatus: auth?.user?.email_confirmed_at ? 'Active · email verified' : 'Active',
    };
  },

  getStorageDetails: async () => {
    const { bills, products, drafts, templates } = await loadAll();
    const breakdown = [
      { name: 'Bills', bytes: sizeOf(bills), color: '#1B3A6B' },
      { name: 'Products', bytes: sizeOf(products), color: '#2756A0' },
      { name: 'Drafts & templates', bytes: sizeOf(drafts) + sizeOf(templates), color: '#8FA6C8' },
    ];
    return { usedBytes: breakdown.reduce((s, x) => s + x.bytes, 0), breakdown };
  },

  // Last 7 days: actions recorded in your activity log + bills you created.
  getUsageStatistics: async () => {
    const today = parseLocalDate(localDateStr());
    const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
    const since = days[0].toISOString();
    const [bills, logRes] = await Promise.all([
      safe(billService.listBills(), []),
      businessId()
        ? supabase.from('audit_log').select('created_at').eq('business_id', businessId()).gte('created_at', since)
        : Promise.resolve({ data: [] }),
    ]);
    const log = logRes?.data || [];
    return days.map((d) => {
      const key = localDateStr(d);
      return {
        name: DAYS[d.getDay()],
        actions: log.filter((r) => localDateStr(new Date(r.created_at)) === key).length,
        bills: bills.filter((b) => b.createdAt && localDateStr(new Date(b.createdAt)) === key).length,
      };
    });
  },

  getSecurityInfo: async () => {
    const [{ data: auth }, mfa] = await Promise.all([
      supabase.auth.getUser(),
      safe(supabase.auth.mfa.listFactors(), { data: null }),
    ]);
    const u = auth?.user;
    const provider = u?.app_metadata?.provider || 'email';
    return {
      currentSession: {
        device: deviceName(),
        started: fmtDateTime(u?.last_sign_in_at),
        method: provider === 'email' ? 'Email & password' : provider[0].toUpperCase() + provider.slice(1),
      },
      twoFactorEnabled: (mfa?.data?.totp || []).some((f) => f.status === 'verified'),
    };
  },
};

export const formatBytes = (b) => {
  if (!b) return '0 KB';
  if (b < 1024 * 1024) return `${Math.max(1, Math.round(b / 1024))} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
};
