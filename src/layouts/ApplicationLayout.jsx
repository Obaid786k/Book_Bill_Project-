import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';
import { Breadcrumb } from '../components/common/Breadcrumb';

const ApplicationLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // BUG 5 FIX: Removed overflow-hidden from root so sticky Topbar works correctly.
    // Used h-screen + flex column on inner content area instead.
    <div className="h-screen w-full flex bg-bg font-body text-ink">
      {/* Sidebar — Desktop static, Mobile drawer via Framer Motion */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* BUG 5 FIX: Topbar is now at the top of a flex column whose parent
            does NOT have overflow-hidden, so sticky positioning works */}
        <Topbar onOpenSidebar={() => setIsSidebarOpen(true)} />
        
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          {/* BUG 6 FIX: Breadcrumb wrapped in same max-width container as main
              so it aligns correctly with page content beneath it */}
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <Breadcrumb />
            <main className="pb-12 pt-2">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationLayout;
