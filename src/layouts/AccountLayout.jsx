import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Topbar } from '../components/common/Topbar';
import { Sidebar } from '../components/common/Sidebar';
import { User, HardDrive, Activity, Shield } from 'lucide-react';
import { clsx } from 'clsx';

const SubNavLink = ({ to, icon: Icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) => clsx(
      "relative flex items-center gap-3 px-3 py-2.5 rounded-md text-[13.5px] transition-all duration-200 overflow-hidden",
      isActive ? "bg-navy/10 text-navy font-bold" : "font-medium text-ink2 hover:bg-row-alt hover:text-ink"
    )}
  >
    {({ isActive }) => (
      <>
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-navy rounded-r-md"></div>}
        <Icon size={18} className={isActive ? 'text-navy' : 'text-ink3'} />
        <span>{children}</span>
      </>
    )}
  </NavLink>
);

export const AccountLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-bg overflow-hidden font-body text-ink">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenSidebar={() => setIsSidebarOpen(true)} />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Account Sidebar */}
          <div className="w-64 border-r border-bb2 bg-paper flex flex-col shrink-0 overflow-y-auto hidden md:flex">
            <div className="p-6 pb-2">
              <h2 className="text-lg font-bold text-navy">My Account</h2>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1">
              <SubNavLink to="/account/overview" icon={User}>Overview</SubNavLink>
              <SubNavLink to="/account/storage" icon={HardDrive}>Storage Usage</SubNavLink>
              <SubNavLink to="/account/usage" icon={Activity}>Usage Statistics</SubNavLink>
              <SubNavLink to="/account/security" icon={Shield}>Security</SubNavLink>
            </nav>
          </div>
          
          {/* Account Content */}
          <div className="flex-1 overflow-y-auto bg-bg p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
