// Dashboard numbers from the REAL saved bills (see analytics.js for the rules).
import { billService } from './billService';
import { dashboardSummary, revenueTrend } from './analytics';

export const dashboardService = {
  getDashboardData: async () => dashboardSummary(await billService.listBills()),

  // { total, prevTotal, changePct, points: [{ label, value, prevValue }] }
  getRevenueTrend: async (range) => revenueTrend(await billService.listBills(), range),
};
