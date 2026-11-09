// Business numbers calculated from the REAL saved bills / products (no sample data).
// Pure functions: give them the lists from billService / productService.
// Rules used everywhere:
//  - Cancelled bills never count as sales.
//  - A bill's day = its invoice date (local), not the time it was saved.
//  - Amounts = the server-computed totals stored on each bill.
//  - "Overdue" = Pending with a due date before today.
import { localDateStr, parseLocalDate, addDays, diffDays } from '../utils/date';

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const num = (v) => Number(v) || 0;
export const billDay = (b) => b?.meta?.invoiceDate || (b?.createdAt ? localDateStr(new Date(b.createdAt)) : '');
export const billAmount = (b) => num(b?.totals?.grand);
export const isActive = (b) => b?.status !== 'Cancelled';
export const isOverdue = (b, today = localDateStr()) => b?.status === 'Pending' && !!b?.meta?.dueDate && b.meta.dueDate < today;
export const displayStatus = (b) => (isOverdue(b) ? 'Overdue' : b?.status || 'Pending');

const sum = (list, f) => list.reduce((s, x) => s + f(x), 0);
const inRange = (b, from, to) => { const d = billDay(b); return d >= from && d <= to; };
const pct = (now, before) => (before > 0 ? Math.round(((now - before) / before) * 1000) / 10 : null);

// Indian financial year (Apr–Mar) that contains `date`.
export const fyStart = (date = new Date()) => new Date(date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1, 3, 1);

const monthStart = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const monthEnd = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const ds = (d) => localDateStr(d);

// ---------- Dashboard ----------
export const dashboardSummary = (bills) => {
  const today = localDateStr();
  const now = parseLocalDate(today);
  const active = bills.filter(isActive);
  const todays = active.filter((b) => billDay(b) === today);
  const month = active.filter((b) => inRange(b, ds(monthStart(now)), today));
  const pending = active.filter((b) => b.status === 'Pending');
  const overdue = pending.filter((b) => isOverdue(b, today));
  const recent = [...bills]
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, 5)
    .map((b) => ({
      id: b.id,
      invoiceNo: b.meta?.invoiceNo || '—',
      customer: b.customer?.custName || 'Walk-in customer',
      amount: billAmount(b),
      status: displayStatus(b),
    }));
  return {
    isSample: false,
    health: {
      todayRevenue: sum(todays, billAmount),
      billsToday: todays.length,
      monthRevenue: sum(month, billAmount),
      monthBills: month.length,
      outstandingAmount: sum(pending, billAmount),
      pendingCount: pending.length,
      overdueAmount: sum(overdue, billAmount),
      overdueCount: overdue.length,
    },
    recentBills: recent,
  };
};

// Sum of bill amounts per day for [from..to] ('YYYY-MM-DD').
const dailyTotals = (bills) => {
  const m = new Map();
  bills.filter(isActive).forEach((b) => { const d = billDay(b); if (d) m.set(d, (m.get(d) || 0) + billAmount(b)); });
  return m;
};

const buckets = (from, to, granularity) => {
  const out = [];
  let start = from;
  while (start <= to) {
    let end;
    if (granularity === 'month') end = monthEnd(start);
    else if (granularity === 'week') end = addDays(start, 6);
    else end = start;
    if (end > to) end = to;
    out.push([start, end]);
    start = addDays(end, 1);
  }
  return out;
};

const sumDays = (daily, a, b) => {
  let t = 0;
  for (let d = a; d <= b; d = addDays(d, 1)) t += daily.get(ds(d)) || 0;
  return t;
};

// { total, prevTotal, changePct, points:[{label,value,prevValue}] }
export const revenueTrend = (bills, { from, to, granularity = 'day', compare = true }) => {
  const daily = dailyTotals(bills);
  const f = parseLocalDate(from);
  const t = parseLocalDate(to);
  const span = diffDays(f, t) + 1;
  const pf = addDays(f, -span);
  const pt = addDays(f, -1);
  const multiYear = f.getFullYear() !== t.getFullYear();
  const prev = buckets(pf, pt, granularity);
  const points = buckets(f, t, granularity).map(([a, b], i) => ({
    label: granularity === 'month'
      ? `${MONTHS[a.getMonth()]}${multiYear ? ` ${String(a.getFullYear()).slice(2)}` : ''}`
      : `${a.getDate()} ${MONTHS[a.getMonth()]}`,
    value: sumDays(daily, a, b),
    prevValue: compare && prev[i] ? sumDays(daily, prev[i][0], prev[i][1]) : null,
  }));
  const total = sum(points, (p) => p.value);
  const prevTotal = compare ? sumDays(daily, pf, pt) : null;
  return { total, prevTotal, changePct: compare ? pct(total, prevTotal) : null, points };
};

// ---------- Insights ----------
export const overviewStats = (bills) => {
  const now = parseLocalDate(localDateStr());
  const active = bills.filter(isActive);
  const thisM = active.filter((b) => inRange(b, ds(monthStart(now)), ds(now)));
  const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastM = active.filter((b) => inRange(b, ds(lastStart), ds(monthEnd(lastStart))));
  const rev = sum(thisM, billAmount);
  const revLast = sum(lastM, billAmount);
  const avg = thisM.length ? rev / thisM.length : 0;
  const avgLast = lastM.length ? revLast / lastM.length : 0;
  return {
    totalRevenue: rev, revenueGrowth: pct(rev, revLast),
    billsGenerated: thisM.length, billsGrowth: pct(thisM.length, lastM.length),
    avgBillValue: avg, avgBillGrowth: pct(avg, avgLast),
    outstanding: sum(active.filter((b) => b.status === 'Pending'), billAmount),
  };
};

// Last 12 months (incl. this one): revenue and GST per month.
export const monthlySeries = (bills, months = 12) => {
  const now = parseLocalDate(localDateStr());
  const active = bills.filter(isActive);
  const out = [];
  for (let i = months - 1; i >= 0; i--) {
    const s = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const list = active.filter((b) => inRange(b, ds(s), ds(monthEnd(s))));
    out.push({
      name: `${MONTHS[s.getMonth()]}${s.getMonth() === 0 || i === months - 1 ? ` ${String(s.getFullYear()).slice(2)}` : ''}`,
      revenue: sum(list, billAmount),
      gst: sum(list, (b) => num(b.totals?.cgst) + num(b.totals?.sgst) + num(b.totals?.igst)),
      bills: list.length,
    });
  }
  return out;
};

export const revenueStats = (bills) => {
  const now = parseLocalDate(localDateStr());
  const fy = fyStart(now);
  const active = bills.filter(isActive);
  const ytd = sum(active.filter((b) => inRange(b, ds(fy), ds(now))), billAmount);
  // same period last FY
  const lyStart = new Date(fy.getFullYear() - 1, 3, 1);
  const lyEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const lastYtd = sum(active.filter((b) => inRange(b, ds(lyStart), ds(lyEnd))), billAmount);
  const series = monthlySeries(bills, 12);
  const best = series.reduce((m, p) => (p.revenue > (m?.revenue ?? -1) ? p : m), null);
  return { total: ytd, growth: pct(ytd, lastYtd), monthlyTrend: series, bestMonth: best?.revenue > 0 ? best : null };
};

export const billStats = (bills) => {
  const now = parseLocalDate(localDateStr());
  const fy = fyStart(now);
  const list = bills.filter(isActive).filter((b) => inRange(b, ds(fy), ds(now)));
  const amounts = list.map(billAmount);
  const itemsPerBill = list.map((b) => (b.items || []).filter((it) => String(it.name || '').trim()).length);
  // last 8 weeks (Mon-start) bill counts
  const monday = addDays(now, -((now.getDay() + 6) % 7));
  const weeks = [];
  for (let i = 7; i >= 0; i--) {
    const a = addDays(monday, -7 * i);
    const b = addDays(a, 6);
    weeks.push({ name: `${a.getDate()} ${MONTHS[a.getMonth()]}`, bills: bills.filter(isActive).filter((x) => inRange(x, ds(a), ds(b))).length });
  }
  const busiest = weeks.reduce((m, w) => (w.bills > (m?.bills ?? -1) ? w : m), null);
  return {
    totalBills: list.length,
    averageValue: list.length ? sum(amounts, (x) => x) / list.length : 0,
    largestBill: amounts.length ? Math.max(...amounts) : 0,
    avgItems: list.length ? Math.round((sum(itemsPerBill, (x) => x) / list.length) * 10) / 10 : 0,
    volumeTrend: weeks,
    busiestWeek: busiest?.bills > 0 ? busiest : null,
  };
};

export const gstStats = (bills) => {
  const now = parseLocalDate(localDateStr());
  const fy = fyStart(now);
  const list = bills.filter(isActive).filter((b) => inRange(b, ds(fy), ds(now)));
  const cgst = sum(list, (b) => num(b.totals?.cgst));
  const sgst = sum(list, (b) => num(b.totals?.sgst));
  const igst = sum(list, (b) => num(b.totals?.igst));
  const monthlyTax = [];
  for (let s = new Date(fy); s <= now; s = new Date(s.getFullYear(), s.getMonth() + 1, 1)) {
    const l = list.filter((b) => inRange(b, ds(s), ds(monthEnd(s))));
    monthlyTax.push({ name: MONTHS[s.getMonth()], tax: sum(l, (b) => num(b.totals?.cgst) + num(b.totals?.sgst) + num(b.totals?.igst)) });
  }
  return {
    totalTax: cgst + sgst + igst,
    breakdown: [{ name: 'CGST', value: cgst }, { name: 'SGST', value: sgst }, { name: 'IGST', value: igst }],
    monthlyTax,
  };
};

export const paymentStats = (bills) => {
  const today = localDateStr();
  const now = parseLocalDate(today);
  const fy = fyStart(now);
  const active = bills.filter(isActive);
  const fyList = active.filter((b) => inRange(b, ds(fy), today));
  const paid = fyList.filter((b) => b.status === 'Paid');
  const pendingAll = active.filter((b) => b.status === 'Pending');
  const overdueAll = pendingAll.filter((b) => isOverdue(b, today));
  const collected = sum(paid, billAmount);
  const billed = sum(fyList, billAmount);
  return {
    totalCollected: collected,
    outstanding: sum(pendingAll, billAmount),
    collectionRate: billed > 0 ? Math.round((collected / billed) * 100) : 0,
    statusBreakdown: [
      { name: 'Paid', value: active.filter((b) => b.status === 'Paid').length },
      { name: 'Pending', value: pendingAll.length - overdueAll.length },
      { name: 'Overdue', value: overdueAll.length },
    ],
    pendingCount: pendingAll.length,
    overdueCount: overdueAll.length,
  };
};

// Products: units sold (last 30 days), revenue by category, catalogue facts, slow movers.
export const productStats = (bills, products = []) => {
  const today = localDateStr();
  const from = ds(addDays(parseLocalDate(today), -29));
  const recent = bills.filter(isActive).filter((b) => inRange(b, from, today));
  const byName = new Map(products.map((p) => [String(p.name || '').trim().toLowerCase(), p]));
  const units = new Map();
  const catRevenue = new Map();
  recent.forEach((b) => (b.items || []).forEach((it) => {
    const name = String(it.name || '').trim();
    if (!name) return;
    const qty = num(it.qty);
    const gross = qty * num(it.rate) * (1 - Math.min(100, num(it.disc)) / 100);
    units.set(name, (units.get(name) || 0) + qty);
    const cat = byName.get(name.toLowerCase())?.category || 'Not in catalogue';
    catRevenue.set(cat, (catRevenue.get(cat) || 0) + gross);
  }));
  const topSelling = [...units.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, sales]) => ({ name, sales }));
  const revenueByCategory = [...catRevenue.entries()].sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value: Math.round(value) }));
  const rates = products.map((p) => num(p.rate));
  const top = products.reduce((m, p) => (num(p.rate) > num(m?.rate ?? -1) ? p : m), null);
  const soldNames = new Set([...units.keys()].map((n) => n.toLowerCase()));
  const slowMoving = products.filter((p) => !soldNames.has(String(p.name || '').trim().toLowerCase())).map((p) => p.name);
  return {
    totalProducts: products.length,
    activeCategories: new Set(products.map((p) => p.category).filter(Boolean)).size,
    averagePrice: rates.length ? sum(rates, (x) => x) / rates.length : 0,
    highestPrice: top ? num(top.rate) : 0,
    highestName: top?.name || '',
    topSelling,
    revenueByCategory,
    slowMoving,
  };
};
