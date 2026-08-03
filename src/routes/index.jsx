import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ComingSoonPanel } from '../components/common/ComingSoonPanel';

// Layouts
import MarketingLayout from '../layouts/MarketingLayout';
import AuthLayout from '../layouts/AuthLayout';
import ApplicationLayout from '../layouts/ApplicationLayout';
import BillingLayout from '../layouts/BillingLayout';
import AnalyticsLayout from '../layouts/AnalyticsLayout';
import SettingsLayout from '../layouts/SettingsLayout';
import AccountLayout from '../layouts/AccountLayout';
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import Home from '../pages/marketing/Home';
import Features from '../pages/marketing/Features';
import Pricing from '../pages/marketing/Pricing';
import FAQ from '../pages/marketing/FAQ';
import Contact from '../pages/marketing/Contact';
import PrivacyPolicy from '../pages/marketing/PrivacyPolicy';
import Terms from '../pages/marketing/Terms';

import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import EmailVerification from '../pages/auth/EmailVerification';

import BusinessSetup from '../pages/onboarding/BusinessSetup';
import WelcomeScreen from '../pages/onboarding/WelcomeScreen';

import Dashboard from '../pages/dashboard/Dashboard';
import NotificationCenter from '../pages/dashboard/NotificationCenter';
import NewBill from '../pages/billing/NewBill';
import DraftManager from '../pages/billing/DraftManager';
import BillHistory from '../pages/billing/BillHistory';
import Templates from '../pages/billing/Templates';
import ProductsList from '../pages/products/ProductsList';
import CategoryManager from '../pages/products/CategoryManager';
import ProductAnalytics from '../pages/products/ProductAnalytics';

// Insights
import Overview from '../pages/insights/Overview';
import Revenue from '../pages/insights/Revenue';
import Bills from '../pages/insights/Bills';
import GST from '../pages/insights/GST';
import Payments from '../pages/insights/Payments';
import Reports from '../pages/insights/Reports';

// Settings
import BusinessProfile from '../pages/settings/BusinessProfile';
import InvoicePreferences from '../pages/settings/InvoicePreferences';
import GSTSettings from '../pages/settings/GSTSettings';
import PaymentSettings from '../pages/settings/PaymentSettings';
import NotificationSettings from '../pages/settings/NotificationSettings';
import AppearanceSettings from '../pages/settings/AppearanceSettings';

// Account
import AccountOverview from '../pages/account/AccountOverview';
import StorageUsage from '../pages/account/StorageUsage';
import UsageStatistics from '../pages/account/UsageStatistics';
import AccountSecurity from '../pages/account/AccountSecurity';

import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { SuperAdminRoute } from '../components/common/SuperAdminRoute';
import { NotFound404 } from '../components/common/states';
import { useAuthStore } from '../store/authStore';

// Admin
import PlatformDashboard from '../pages/admin/PlatformDashboard';
import UserStatistics from '../pages/admin/UserStatistics';
import DatabaseHealth from '../pages/admin/DatabaseHealth';
import StorageMonitoring from '../pages/admin/StorageMonitoring';
import Performance from '../pages/admin/Performance';
import SystemLogs from '../pages/admin/SystemLogs';
import BackupStatus from '../pages/admin/BackupStatus';
import FeatureFlags from '../pages/admin/FeatureFlags';

const Placeholder = ({ title }) => (
  <div className="p-8">
    <ComingSoonPanel title={title} description="This section is being built and will be available soon." />
  </div>
);

const AppRoutes = () => {
  return (
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
        <Route path="/verify-email" element={<EmailVerification />} />
      </Route>

      {/* Onboarding (Authenticated but not setup) */}
      <Route path="/setup" element={<BusinessSetup />} />
      <Route path="/welcome" element={<WelcomeScreen />} />

      {/* Application / Authenticated & Setup */}
      <Route element={<ProtectedRoute />}>
        <Route element={<ApplicationLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notifications" element={<NotificationCenter />} />
        
        {/* Products */}
        <Route path="/products" element={<ProductsList />} />
        <Route path="/products/categories" element={<CategoryManager />} />
        <Route path="/products/analytics" element={<ProductAnalytics />} />
        
        {/* Analytics Module */}
        <Route path="/insights" element={<AnalyticsLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="bills" element={<Bills />} />
          <Route path="products" element={<ProductAnalytics />} />
          <Route path="gst" element={<GST />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        </Route>
        
        {/* Settings Module */}
        <Route path="/settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<BusinessProfile />} />
          <Route path="invoice" element={<InvoicePreferences />} />
          <Route path="gst" element={<GSTSettings />} />
          <Route path="payments" element={<PaymentSettings />} />
          <Route path="notifications" element={<NotificationSettings />} />
          <Route path="appearance" element={<AppearanceSettings />} />
        </Route>
        
        {/* Billing Module */}
        <Route path="/billing" element={<BillingLayout />}>
          <Route index element={<Navigate to="new" replace />} />
          <Route path="new" element={<NewBill />} />
          <Route path="drafts" element={<DraftManager />} />
          <Route path="templates" element={<Templates />} />
          <Route path="history" element={<BillHistory />} />
        </Route>
        
        {/* Account Module */}
        <Route path="/account" element={<AccountLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AccountOverview />} />
          <Route path="storage" element={<StorageUsage />} />
          <Route path="usage" element={<UsageStatistics />} />
          <Route path="security" element={<AccountSecurity />} />
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
  );
};

export default AppRoutes;
