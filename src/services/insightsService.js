// Insights from the REAL saved bills and products (rules in analytics.js).
// Reads go through the shared cache, so opening several Insights pages costs one fetch.
import { billService } from './billService';
import { productService } from './productService';
import { overviewStats, revenueStats, billStats, gstStats, paymentStats, productStats } from './analytics';

const bills = () => billService.listBills();

export const insightsService = {
  getOverview: async () => overviewStats(await bills()),
  getRevenueAnalytics: async () => revenueStats(await bills()),
  getBillAnalytics: async () => billStats(await bills()),
  getGSTAnalytics: async () => gstStats(await bills()),
  getPaymentAnalytics: async () => paymentStats(await bills()),
  getProductAnalytics: async () => {
    const [b, products] = await Promise.all([bills(), productService.getProducts().catch(() => [])]);
    return productStats(b, products);
  },
};
