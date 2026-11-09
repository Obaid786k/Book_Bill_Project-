import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MarketingLayout from '../layouts/MarketingLayout';
import AuthLayout from '../layouts/AuthLayout';
import AppShell from '../components/shell/AppShell';
import SuperAdminLayout from '../layouts/SuperAdminLayout';
// Pages load on demand (one small file each) — see ./pages.js
import {
  Home,
  Features,
  Pricing,
  FAQ,
  Contact,
  PrivacyPolicy,
  Terms,
  Login,
  Signup,
  ForgotPassword,
  ResetPassword,
  EmailVerification,
  EmailConfirmed,
  BusinessSetup,
  WelcomeScreen,
  Dashboard,
  NotificationCenter,
  NewBill,
  DraftManager,
  BillHistory,
  Templates,
  ProductsList,
  CategoryManager,
  ProductAnalytics,
  Overview,
  Revenue,
  Bills,
  GST,
  Payments,
  Reports,
  BusinessProfile,
  InvoicePreferences,
  GSTSettings,
  PaymentSettings,
  NotificationSettings,
  AppearanceSettings,
  MyProfile,
  AccountOverview,
  StorageUsage,
  UsageStatistics,
  AccountSecurity,
  PlatformDashboard,
  UserStatistics,
  DatabaseHealth,
  StorageMonitoring,
  Performance,
  SystemLogs,
  BackupStatus,
  FeatureFlags,
} from './pages';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { SuperAdminRoute } from '../components/common/SuperAdminRoute';
import { NotFound404 } from '../components/common/states';
import GlobalLoading from '../components/common/states/GlobalLoading';

const AppRoutes = () => {
  return (
    // Outer fallback only shows on the very first page load; layouts have their own.
    <Suspense fallback={<GlobalLoading />}>
    <Routes>
      {/* Public / Marketing */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
      </Route>

      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/email-confirmed" element={<EmailConfirmed />} />
      </Route>

      {/* Onboarding (Authenticated but not setup) */}
      <Route element={<ProtectedRoute authOnly={true} />}>
        <Route path="/setup" element={<BusinessSetup />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
      </Route>

      {/* Application / Authenticated & Setup — one shell for every logged-in page */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notifications" element={<NotificationCenter />} />

          {/* Products */}
          <Route path="/products" element={<ProductsList />} />
          <Route path="/products/categories" element={<CategoryManager />} />
          <Route path="/products/analytics" element={<ProductAnalytics />} />

          {/* Insights */}
          <Route path="/insights">
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="bills" element={<Bills />} />
            <Route path="products" element={<Navigate to="/products/analytics" replace />} />
            <Route path="gst" element={<GST />} />
            <Route path="payments" element={<Payments />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Settings */}
          <Route path="/settings">
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<BusinessProfile />} />
            <Route path="invoice" element={<InvoicePreferences />} />
            <Route path="gst" element={<GSTSettings />} />
            <Route path="payments" element={<PaymentSettings />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="appearance" element={<AppearanceSettings />} />
          </Route>

          {/* Billing */}
          <Route path="/billing">
            <Route index element={<Navigate to="new" replace />} />
            <Route path="new" element={<NewBill />} />
            <Route path="drafts" element={<DraftManager />} />
            <Route path="templates" element={<Templates />} />
            <Route path="history" element={<BillHistory />} />
          </Route>

          {/* Account */}
          <Route path="/account">
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="overview" element={<AccountOverview />} />
            <Route path="storage" element={<StorageUsage />} />
            <Route path="usage" element={<UsageStatistics />} />
            <Route path="security" element={<AccountSecurity />} />
          </Route>
        </Route>

        {/* Admin Module */}
        <Route element={<SuperAdminRoute />}>
          <Route path="/admin" element={<SuperAdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PlatformDashboard />} />
            <Route path="users" element={<UserStatistics />} />
            <Route path="database" element={<DatabaseHealth />} />
            <Route path="storage" element={<StorageMonitoring />} />
            <Route path="performance" element={<Performance />} />
            <Route path="logs" element={<SystemLogs />} />
            <Route path="backups" element={<BackupStatus />} />
            <Route path="flags" element={<FeatureFlags />} />
          </Route>
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound404 />} />
    </Routes>
    </Suspense>
  );
};

export default AppRoutes;
