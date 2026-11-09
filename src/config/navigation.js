// Single source of truth for the logged-in app navigation.
// Sidebar, page headers (title / eyebrow) and the Back button all read from here.
import {
  LayoutDashboard, Receipt, FilePlus, PencilLine, History, LayoutTemplate,
  Package, List, Tag, BarChart3,
  LineChart, PieChart, IndianRupee, FileText, Percent, CreditCard, FileBarChart,
  Settings, Store, Bell, Palette,
  ShieldAlert, UserCircle, User, HardDrive, Activity, Shield, HelpCircle,
} from 'lucide-react';

export const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  {
    key: 'billing', label: 'Billing', icon: Receipt, base: '/billing',
    children: [
      { label: 'New bill', path: '/billing/new', icon: FilePlus },
      { label: 'Drafts', path: '/billing/drafts', icon: PencilLine, badgeKey: 'drafts' },
      { label: 'Bill history', path: '/billing/history', icon: History },
      { label: 'Templates', path: '/billing/templates', icon: LayoutTemplate },
    ],
  },
  {
    key: 'products', label: 'Products', icon: Package, base: '/products',
    children: [
      { label: 'All products', path: '/products', end: true, icon: List },
      { label: 'Categories', path: '/products/categories', icon: Tag },
      { label: 'Analytics', path: '/products/analytics', icon: BarChart3 },
    ],
  },
  {
    key: 'insights', label: 'Insights', icon: LineChart, base: '/insights',
    children: [
      { label: 'Overview', path: '/insights/overview', icon: PieChart },
      { label: 'Revenue', path: '/insights/revenue', icon: IndianRupee },
      { label: 'Bills', path: '/insights/bills', icon: FileText },
      { label: 'GST', path: '/insights/gst', icon: Percent },
      { label: 'Payments', path: '/insights/payments', icon: CreditCard },
      { label: 'Reports', path: '/insights/reports', icon: FileBarChart },
    ],
  },
  {
    key: 'settings', label: 'Settings', icon: Settings, base: '/settings',
    children: [
      { label: 'Business profile', path: '/settings/profile', icon: Store },
      { label: 'Invoice', path: '/settings/invoice', icon: FileText },
      { label: 'GST', path: '/settings/gst', icon: Percent },
      { label: 'Payments', path: '/settings/payments', icon: CreditCard },
      { label: 'Notifications', path: '/settings/notifications', icon: Bell },
      { label: 'Appearance', path: '/settings/appearance', icon: Palette, comingSoon: true },
    ],
  },
  {
    key: 'account', label: 'Account', icon: UserCircle, base: '/account',
    children: [
      { label: 'My profile', path: '/account/profile', icon: User },
      { label: 'Account overview', path: '/account/overview', icon: Activity },
      { label: 'Security', path: '/account/security', icon: Shield },
      { label: 'Usage statistics', path: '/account/usage', icon: BarChart3 },
      { label: 'Storage', path: '/account/storage', icon: HardDrive },
      { label: 'Help and support', href: '/faq', icon: HelpCircle, external: true },
    ],
  },
];

export const ADMIN_NAV = { label: 'Super admin', icon: ShieldAlert, path: '/admin', adminOnly: true };

// pathname -> { title, eyebrow, parent }
// parent = where Back goes when there is no in-app history:
// first page of a module -> /dashboard, other pages -> that module's first page.
export const ROUTE_META = {
  '/dashboard':             { title: 'Dashboard', eyebrow: null, parent: null },
  '/notifications':         { title: 'Notifications', eyebrow: null, parent: '/dashboard' },

  '/billing/new':           { title: 'New bill', eyebrow: 'Billing', parent: '/dashboard' },
  '/billing/drafts':        { title: 'Drafts', eyebrow: 'Billing', parent: '/billing/new' },
  '/billing/history':       { title: 'Bill history', eyebrow: 'Billing', parent: '/billing/new' },
  '/billing/templates':     { title: 'Templates', eyebrow: 'Billing', parent: '/billing/new' },

  '/products':              { title: 'All products', eyebrow: 'Products', parent: '/dashboard' },
  '/products/categories':   { title: 'Categories', eyebrow: 'Products', parent: '/products' },
  '/products/analytics':    { title: 'Product analytics', eyebrow: 'Products', parent: '/products' },

  '/insights/overview':     { title: 'Overview', eyebrow: 'Insights', parent: '/dashboard' },
  '/insights/revenue':      { title: 'Revenue', eyebrow: 'Insights', parent: '/insights/overview' },
  '/insights/bills':        { title: 'Bills', eyebrow: 'Insights', parent: '/insights/overview' },
  '/insights/gst':          { title: 'GST', eyebrow: 'Insights', parent: '/insights/overview' },
  '/insights/payments':     { title: 'Payments', eyebrow: 'Insights', parent: '/insights/overview' },
  '/insights/reports':      { title: 'Reports', eyebrow: 'Insights', parent: '/insights/overview' },

  '/settings/profile':       { title: 'Business profile', eyebrow: 'Settings', parent: '/dashboard' },
  '/settings/invoice':       { title: 'Invoice preferences', eyebrow: 'Settings', parent: '/settings/profile' },
  '/settings/gst':           { title: 'GST settings', eyebrow: 'Settings', parent: '/settings/profile' },
  '/settings/payments':      { title: 'Payment settings', eyebrow: 'Settings', parent: '/settings/profile' },
  '/settings/notifications': { title: 'Notification settings', eyebrow: 'Settings', parent: '/settings/profile' },
  '/settings/appearance':    { title: 'Appearance', eyebrow: 'Settings', parent: '/settings/profile' },

  '/account/profile':       { title: 'My profile', eyebrow: 'Account', parent: '/dashboard' },
  '/account/overview':      { title: 'Account overview', eyebrow: 'Account', parent: '/account/profile' },
  '/account/security':      { title: 'Security', eyebrow: 'Account', parent: '/account/profile' },
  '/account/usage':         { title: 'Usage statistics', eyebrow: 'Account', parent: '/account/profile' },
  '/account/storage':       { title: 'Storage usage', eyebrow: 'Account', parent: '/account/profile' },
};

export const getRouteMeta = (pathname = '') => {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return ROUTE_META[clean] || { title: '', eyebrow: null, parent: '/dashboard' };
};
