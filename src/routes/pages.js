// Every page is its own small file (code splitting), so the first load only
// downloads what the current screen needs. Pages can be loaded early:
//  - preloadRoute(path)   — on sidebar hover/focus: page code + its data
//  - preloadAppPages()    — once the app is idle after login: all app page code
import { lazy } from 'react';
import { billService } from '../services/billService';
import { productService } from '../services/productService';
import { settingsService } from '../services/settingsService';
import { shopService } from '../services/shopService';

// lazy() + a .preload() that starts the download without rendering.
// A failed download is forgotten so the next try can succeed.
const page = (factory) => {
  let p = null;
  const load = () => p || (p = factory().catch((err) => { p = null; throw err; }));
  const C = lazy(load);
  C.preload = load;
  return C;
};

// Marketing
export const Home = page(() => import('../pages/marketing/Home'));
export const Features = page(() => import('../pages/marketing/Features'));
export const Pricing = page(() => import('../pages/marketing/Pricing'));
export const FAQ = page(() => import('../pages/marketing/FAQ'));
export const Contact = page(() => import('../pages/marketing/Contact'));
export const PrivacyPolicy = page(() => import('../pages/marketing/PrivacyPolicy'));
export const Terms = page(() => import('../pages/marketing/Terms'));

// Auth + onboarding
export const Login = page(() => import('../pages/auth/Login'));
export const Signup = page(() => import('../pages/auth/Signup'));
export const ForgotPassword = page(() => import('../pages/auth/ForgotPassword'));
export const ResetPassword = page(() => import('../pages/auth/ResetPassword'));
export const EmailVerification = page(() => import('../pages/auth/EmailVerification'));
export const EmailConfirmed = page(() => import('../pages/auth/EmailConfirmed'));
export const BusinessSetup = page(() => import('../pages/onboarding/BusinessSetup'));
export const WelcomeScreen = page(() => import('../pages/onboarding/WelcomeScreen'));

// App
export const Dashboard = page(() => import('../pages/dashboard/Dashboard'));
export const NotificationCenter = page(() => import('../pages/dashboard/NotificationCenter'));
export const NewBill = page(() => import('../pages/billing/NewBill'));
export const DraftManager = page(() => import('../pages/billing/DraftManager'));
export const BillHistory = page(() => import('../pages/billing/BillHistory'));
export const Templates = page(() => import('../pages/billing/Templates'));
export const ProductsList = page(() => import('../pages/products/ProductsList'));
export const CategoryManager = page(() => import('../pages/products/CategoryManager'));
export const ProductAnalytics = page(() => import('../pages/products/ProductAnalytics'));
export const Overview = page(() => import('../pages/insights/Overview'));
export const Revenue = page(() => import('../pages/insights/Revenue'));
export const Bills = page(() => import('../pages/insights/Bills'));
export const GST = page(() => import('../pages/insights/GST'));
export const Payments = page(() => import('../pages/insights/Payments'));
export const Reports = page(() => import('../pages/insights/Reports'));
export const BusinessProfile = page(() => import('../pages/settings/BusinessProfile'));
export const InvoicePreferences = page(() => import('../pages/settings/InvoicePreferences'));
export const GSTSettings = page(() => import('../pages/settings/GSTSettings'));
export const PaymentSettings = page(() => import('../pages/settings/PaymentSettings'));
export const NotificationSettings = page(() => import('../pages/settings/NotificationSettings'));
export const AppearanceSettings = page(() => import('../pages/settings/AppearanceSettings'));
export const MyProfile = page(() => import('../pages/account/MyProfile'));
export const AccountOverview = page(() => import('../pages/account/AccountOverview'));
export const StorageUsage = page(() => import('../pages/account/StorageUsage'));
export const UsageStatistics = page(() => import('../pages/account/UsageStatistics'));
export const AccountSecurity = page(() => import('../pages/account/AccountSecurity'));

// Super admin
export const PlatformDashboard = page(() => import('../pages/admin/PlatformDashboard'));
export const UserStatistics = page(() => import('../pages/admin/UserStatistics'));
export const DatabaseHealth = page(() => import('../pages/admin/DatabaseHealth'));
export const StorageMonitoring = page(() => import('../pages/admin/StorageMonitoring'));
export const Performance = page(() => import('../pages/admin/Performance'));
export const SystemLogs = page(() => import('../pages/admin/SystemLogs'));
export const BackupStatus = page(() => import('../pages/admin/BackupStatus'));
export const FeatureFlags = page(() => import('../pages/admin/FeatureFlags'));

const settingsData = () => [settingsService.getBusinessProfile()];

// path -> [page, () => data reads]. Data goes into the shared cache (src/lib/dataCache.js).
const ROUTES = {
  '/dashboard': [Dashboard],
  '/notifications': [NotificationCenter],
  '/billing/new': [NewBill, () => [billService.getDrafts(), billService.getTemplates(), shopService.getProfile(), settingsService.getInvoicePreferences()]],
  '/billing/drafts': [DraftManager, () => [billService.getDrafts()]],
  '/billing/history': [BillHistory, () => [billService.listBills()]],
  '/billing/templates': [Templates, () => [billService.getTemplates()]],
  '/products': [ProductsList, () => [productService.getProducts(), productService.getCategories()]],
  '/products/categories': [CategoryManager, () => [productService.getCategories()]],
  '/products/analytics': [ProductAnalytics],
  '/insights/overview': [Overview],
  '/insights/revenue': [Revenue],
  '/insights/bills': [Bills],
  '/insights/gst': [GST],
  '/insights/payments': [Payments],
  '/insights/reports': [Reports],
  '/settings/profile': [BusinessProfile, settingsData],
  '/settings/invoice': [InvoicePreferences, settingsData],
  '/settings/gst': [GSTSettings, settingsData],
  '/settings/payments': [PaymentSettings, settingsData],
  '/settings/notifications': [NotificationSettings, settingsData],
  '/settings/appearance': [AppearanceSettings],
  '/account/profile': [MyProfile],
  '/account/overview': [AccountOverview],
  '/account/security': [AccountSecurity],
  '/account/usage': [UsageStatistics],
  '/account/storage': [StorageUsage],
  '/admin': [PlatformDashboard],
};

const warmed = new Set();

// Start loading a page (code + data) before the click. Safe to call many times.
export const preloadRoute = (path) => {
  const entry = ROUTES[path];
  if (!entry) return;
  const [Page, data] = entry;
  Page.preload().catch(() => {});
  // Data: once per hover burst is enough — the cache dedupes and expires on its own.
  if (data && !warmed.has(path)) {
    warmed.add(path);
    setTimeout(() => warmed.delete(path), 30_000);
    try { Promise.allSettled(data()); } catch { /* ignore */ }
  }
};

// After login, quietly download all app page code while the browser is idle,
// so the first click on any module doesn't wait for a download.
export const preloadAppPages = () => {
  const run = () => Object.values(ROUTES).forEach(([Page]) => Page.preload().catch(() => {}));
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 3000 });
  else setTimeout(run, 1500);
};
