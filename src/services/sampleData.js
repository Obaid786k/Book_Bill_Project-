// src/services/sampleData.js
// DEMO numbers ONLY for the marketing home page preview (a visitor has no data).
// The real app never uses this file — see dashboardService.js / analytics.js.
import { parseLocalDate, addDays, diffDays, localDateStr } from '../utils/date';


export const mockDashboardData = {
  isSample: true,
  health: {
    todayRevenue: 4720,
    billsToday: 3,
    monthRevenue: 86410,
    monthBills: 42,
    outstandingAmount: 12380,
    pendingCount: 6,
    overdueAmount: 5900,
    overdueCount: 1,
  },
  recentBills: [
    { id: 'INV-0014', customer: 'Customer name', amount: 2360, status: 'Pending' },
    { id: 'INV-0013', customer: 'Customer name', amount: 1180, status: 'Paid' },
    { id: 'INV-0012', customer: 'Customer name', amount: 5900, status: 'Overdue' },
    { id: 'INV-0011', customer: 'Customer name', amount: 944, status: 'Paid' },
    { id: 'INV-0010', customer: 'Customer name', amount: 3540, status: 'Paid' },
  ],
};

// Same sample number for the same day every time (so charts don't jump).
const sampleDay = (date) => {
  const key = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const noise = Math.abs(Math.sin(key * 12.9898) * 43758.5453) % 1; // 0..1
  const weekend = date.getDay() === 0 ? 0.55 : 1;
  return Math.round((2200 + noise * 3400) * weekend);
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Split [from..to] into buckets of day / week / month.
const buckets = (from, to, granularity) => {
  const out = [];
  let start = from;
  while (start <= to) {
    let end;
    if (granularity === 'month') end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    else if (granularity === 'week') end = addDays(start, 6);
    else end = start;
    if (end > to) end = to;
    out.push([start, end]);
    start = addDays(end, 1);
  }
  return out;
};

const sumRange = (a, b) => {
  let total = 0;
  for (let d = a; d <= b; d = addDays(d, 1)) total += sampleDay(d);
  return total;
};

const labelFor = (d, granularity, multiYear) =>
  granularity === 'month'
    ? `${MONTHS[d.getMonth()]}${multiYear ? ` ${String(d.getFullYear()).slice(2)}` : ''}`
    : `${d.getDate()} ${MONTHS[d.getMonth()]}`;

export const sampleService = {
  // { total, prevTotal, changePct, points: [{ label, value, prevValue }] }
  getRevenueTrend: async ({ from, to, granularity = 'day', compare = true }) => {
    const f = parseLocalDate(from);
    const t = parseLocalDate(to);
    const today = parseLocalDate(localDateStr());
    const span = diffDays(f, t) + 1;
    const pf = addDays(f, -span);
    const pt = addDays(f, -1);
    const multiYear = f.getFullYear() !== t.getFullYear();

    const cur = buckets(f, t, granularity);
    const prev = buckets(pf, pt, granularity);

    const points = cur.map(([a, b], i) => {
      const value = a > today ? 0 : sumRange(a, b > today ? today : b);
      const p = prev[i];
      return {
        label: labelFor(a, granularity, multiYear),
        value,
        prevValue: compare && p ? sumRange(p[0], p[1]) : null,
      };
    });

    const total = points.reduce((s, p) => s + p.value, 0);
    const prevTotal = compare ? sumRange(pf, pt) : null;
    const changePct = compare && prevTotal ? ((total - prevTotal) / prevTotal) * 100 : null;
    return { total, prevTotal, changePct, points, isSample: true };
  },
};

// Bottom row of the marketing preview dashboard.
export const sampleOverview = {
  gst: { breakdown: [{ name: 'CGST', value: 4500 }, { name: 'SGST', value: 4500 }, { name: 'IGST', value: 3450 }] },
  products: { topSelling: [{ name: 'Paracetamol 500mg', sales: 120 }, { name: 'Consultation Fee', sales: 85 }, { name: 'Aashirvaad Atta', sales: 62 }, { name: 'Amul Butter', sales: 49 }] },
  payments: { statusBreakdown: [{ name: 'Paid', value: 85 }, { name: 'Pending', value: 12 }, { name: 'Overdue', value: 3 }] },
};
