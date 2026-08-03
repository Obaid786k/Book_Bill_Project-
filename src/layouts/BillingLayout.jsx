import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Topbar } from '../components/common/Topbar';
import { Sidebar } from '../components/common/Sidebar';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { FilePlus2, FileEdit, Files, History } from 'lucide-react';
import { clsx } from 'clsx';

export const BillingLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navItems = [
    { path: '/billing/new', label: 'New Bill', icon: FilePlus2 },
    { path: '/billing/drafts', label: 'Drafts', icon: FileEdit },
    { path: '/billing/templates', label: 'Templates', icon: Files },
    { path: '/billing/history', label: 'History', icon: History }
  ];

  return (
    <div className="flex h-screen bg-bg overflow-hidden font-body text-ink print:h-auto print:bg-white print:overflow-visible">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 print:min-w-full">
        <Topbar onOpenSidebar={() => setIsSidebarOpen(true)} />
        
        <div className="flex-1 flex overflow-hidden print:overflow-visible">
          {/* Secondary Sidebar for Billing */}
          <div className="w-64 border-r border-bb2 bg-paper flex flex-col shrink-0 overflow-y-auto hidden md:flex shadow-[2px_0_10px_rgba(0,0,0,0.02)] no-print">
            <div className="p-6 pb-4">
              <h2 className="text-lg font-bold text-navy">Billing</h2>
            </div>
            <nav className="flex-1 px-4 space-y-1">
              {navItems.map(item => (
                <NavLink 
                  key={item.path}
                  to={item.path} 
                  className={({isActive}) => clsx(
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
          
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto print:overflow-visible">
            {/* Standard page wrapper with Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 print:p-0 print:m-0 print:max-w-none">
              <Breadcrumb />
              <main className="pb-12 pt-2 print:p-0">
                <Outlet />
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingLayout;
