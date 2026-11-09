// Super admin numbers from the REAL database (migration 0010 — super admins only).
// Each RPC checks profiles.is_super_admin on the server and returns counts/sizes only.
import { supabase } from '../lib/supabaseClient';
import { handleSupabaseError } from '../utils/handleSupabaseError';

export const SUPABASE_DASHBOARD_URL = 'https://supabase.com/dashboard/projects';

const call = async (fn, args) => {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) {
    const err = handleSupabaseError(error, { table: 'rpc', action: fn });
    const msg = error.message || '';
    if (/not authorized/i.test(msg)) {
      err.message = 'Only super admins can see these numbers. Set is_super_admin = true for your profile in Supabase.';
    } else if (error.code === 'PGRST202' || /could not find the function/i.test(msg)) {
      err.message = 'Admin data is not set up on the server yet. Run "npx supabase db push" (migration 0010).';
    }
    throw err;
  }
  return data || {};
};

const n = (v) => Number(v) || 0;

// "3 days 4 hrs" since a date.
export const runningFor = (iso) => {
  if (!iso) return '—';
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  if (d) return `${d} day${d > 1 ? 's' : ''} ${h} hr${h !== 1 ? 's' : ''}`;
  if (h) return `${h} hr${h !== 1 ? 's' : ''} ${mins % 60} min`;
  return `${mins} min`;
};

export const formatBytes = (b) => {
  const v = n(b);
  if (v < 1024) return `${v} B`;
  if (v < 1024 ** 2) return `${(v / 1024).toFixed(1)} KB`;
  if (v < 1024 ** 3) return `${(v / 1024 ** 2).toFixed(1)} MB`;
  return `${(v / 1024 ** 3).toFixed(2)} GB`;
};

const overview = async () => {
  const d = await call('admin_console_overview');
  const days = (d.last7Days || []).map((x) => ({ name: x.name, signups: n(x.users), businesses: n(x.businesses), bills: n(x.bills) }));
  return {
    totalUsers: n(d.totalUsers),
    verifiedUsers: n(d.verifiedUsers),
    activeUsers24h: n(d.activeUsers24h),
    activeUsers7d: n(d.activeUsers7d),
    totalTenants: n(d.totalTenants),
    setupDone: n(d.setupDone),
    totalBills: n(d.totalBills),
    billsToday: n(d.billsToday),
    cancelledBills: n(d.cancelledBills),
    totalProducts: n(d.totalProducts),
    totalDrafts: n(d.totalDrafts),
    customTemplates: n(d.customTemplates),
    errors24h: n(d.errors24h),
    dbStartedAt: d.dbStartedAt || null,
    signupTrend: days,
    signups7d: days.reduce((s, x) => s + x.signups, 0),
  };
};

// Activity-log event -> readable line (no bill amounts; the server strips them).
const EVENT_LABELS = {
  bill_finalized: 'Bill saved',
  bill_updated: 'Bill edited',
  bill_status_changed: 'Bill status changed',
  gst_settings_changed: 'GST settings changed',
  admin_role_changed: 'Super admin role changed',
  invoice_sequence_malformed: 'Invoice number format is broken',
  client_error: 'App error',
};
const describe = (event, d = {}) => {
  const label = EVENT_LABELS[event] || String(event || 'event').replace(/_/g, ' ');
  const bits = [];
  if (d.invoice_no) bits.push(d.invoice_no);
  if (d.old_status || d.new_status) bits.push(`${d.old_status || '—'} → ${d.new_status || '—'}`);
  if (d.old_tax_type || d.new_tax_type) bits.push(`${d.old_tax_type || '—'} → ${d.new_tax_type || '—'}`);
  if ('new_value' in d) bits.push(d.new_value ? 'granted' : 'removed');
  if (d.value) bits.push(`"${d.value}"`);
  if (d.detail) bits.push(d.detail);
  if (d.code) bits.push(`code ${d.code}`);
  return bits.length ? `${label}: ${bits.join(' · ')}` : label;
};

export const adminService = {
  getPlatformDashboard: overview,
  getUserStatistics: overview,

  getDatabaseHealth: async () => {
    const d = await call('admin_database_health');
    return {
      ...d,
      sizeBytes: n(d.sizeBytes),
      connections: n(d.connections),
      activeConnections: n(d.activeConnections),
      maxConnections: n(d.maxConnections),
      cacheHitPct: d.cacheHitPct == null ? null : Number(d.cacheHitPct),
      rowsRead: n(d.rowsRead),
      rowsWritten: n(d.rowsWritten),
      deadlocks: n(d.deadlocks),
      tables: (d.tables || []).map((t) => ({ ...t, rows: n(t.rows), sizeBytes: n(t.sizeBytes), seqScans: n(t.seqScans), indexScans: n(t.indexScans) })),
    };
  },

  getStorageMonitoring: async () => {
    const d = await call('admin_storage_usage');
    const buckets = (d.buckets || []).map((b) => ({ ...b, files: n(b.files), bytes: n(b.bytes) }));
    const fileBytes = buckets.reduce((s, b) => s + b.bytes, 0);
    return {
      databaseBytes: n(d.databaseBytes),
      fileBytes,
      totalBytes: n(d.databaseBytes) + fileBytes,
      totalFiles: buckets.reduce((s, b) => s + b.files, 0),
      buckets,
    };
  },

  getPerformanceMetrics: async () => {
    const d = await call('admin_performance');
    const calls = n(d.queries?.calls);
    const minutes = d.statsSince ? Math.max(1, (Date.now() - new Date(d.statsSince).getTime()) / 60000) : 0;
    return {
      available: !!d.available,
      avgResponseTimeMs: d.queries?.avgMs == null ? null : Number(d.queries.avgMs),
      maxResponseTimeMs: d.queries?.maxMs == null ? null : Number(d.queries.maxMs),
      totalQueries: calls,
      queriesPerMinute: minutes ? calls / minutes : 0,
      statsSince: d.statsSince || null,
      failedPct: Number(d.failedPct) || 0,
      slowest: (d.slowest || []).map((q, i) => ({ id: i + 1, query: q.query, calls: n(q.calls), avgMs: Number(q.avgMs) || 0, maxMs: Number(q.maxMs) || 0 })),
    };
  },

  getSystemLogs: async () => {
    const rows = await call('admin_system_logs', { p_limit: 200 });
    return (Array.isArray(rows) ? rows : []).map((r) => ({
      id: r.id,
      timestamp: r.created_at,
      level: r.level || 'INFO',
      service: r.service || 'system',
      message: describe(r.event, r.details || {}),
      business: r.business || '—',
    }));
  },
};
