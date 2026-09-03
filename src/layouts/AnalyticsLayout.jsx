import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { LayoutDashboard, TrendingUp, Receipt, PackageSearch, Percent, CreditCard, FileText } from 'lucide-react';

const navItems = [
  { path: '/insights/overview', label: 'Overview', icon: LayoutDashboard },
  { path: '/insights/revenue', label: 'Revenue', icon: TrendingUp },
  { path: '/insights/bills', label: 'Bills', icon: Receipt },
  { path: '/insights/products', label: 'Products', icon: PackageSearch },
  { path: '/insights/gst', label: 'GST', icon: Percent },
  { path: '/insights/payments', label: 'Payments', icon: CreditCard },
  { path: '/insights/reports', label: 'Reports', icon: FileText },
];

export const AnalyticsLayout = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)]">
      {/* Mobile Horizontal Navigation */}
      <div className="lg:hidden w-full overflow-x-auto pb-2 scrollbar-hide border-b border-bb2">
        <nav className="flex gap-2 min-w-max px-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-full text-[13.5px] font-semibold whitespace-nowrap transition-colors",
                isActive ? "bg-navy text-white shadow-sm" : "text-ink2 hover:bg-row-alt hover:text-ink"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Desktop Sidebar Navigation */}
      <div className="hidden lg:flex w-64 shrink-0 flex-col gap-1">
        <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-3 px-3">Business Insights</h2>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-md text-[13.5px] transition-all duration-200 overflow-hidden",
                isActive ? "bg-navy/10 text-navy font-bold" : "font-medium text-ink2 hover:bg-row-alt hover:text-ink"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-navy rounded-r-md"></div>}
                  <item.icon size={18} className={isActive ? 'text-navy' : 'text-ink3'} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Analytics Content Area */}
      <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-bb p-4 sm:p-6 lg:p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AnalyticsLayout;
