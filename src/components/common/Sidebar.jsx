import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Receipt, 
  Package, 
  LineChart, 
  Settings, 
  UserCircle, 
  ShieldAlert,
  X,
  LogOut
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { ConfirmDialog } from './ConfirmDialog';
import { useUIStore } from '../../store/uiStore';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/billing/new', label: 'Billing', icon: Receipt },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/insights', label: 'Business Insights', icon: LineChart },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/account', label: 'Account Dashboard', icon: UserCircle },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuthStore();
  const [showLogout, setShowLogout] = useState(false);
  const { isBillingDirty, setPendingNavPath } = useUIStore();

  const handleNavClick = (e, path) => {
    if (isBillingDirty) {
      e.preventDefault();
      setPendingNavPath(path);
      if (onClose) onClose();
    } else {
      if (onClose) onClose();
    }
  };

  const sidebarContent = (
    // BUG 3 FIX: Changed border-border → border-bb throughout
    <div className="h-full flex flex-col bg-paper border-r border-bb w-[240px] shadow-sm">
      <div className="p-4 flex items-center justify-between border-b border-bb h-[50px]">
        <div className="font-bold text-navy flex items-center gap-2">
          <span className="bg-gold text-paper rounded-[5px] py-0.5 px-2 text-[13px]">₹</span> 
          Bill Book
        </div>
        <button className="md:hidden text-ink3 hover:text-ink" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const basePath = item.path === '/billing/new' ? '/billing' : item.path;
          const isItemActive = location.pathname.startsWith(basePath);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={(e) => handleNavClick(e, item.path)}
              className={clsx(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-md text-[13.5px] font-semibold transition-all duration-200 overflow-hidden',
                isItemActive
                  ? 'bg-navy-lt/10 text-navy' 
                  : 'text-ink2 hover:bg-row-alt hover:text-ink'
              )}
            >
              {isItemActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold rounded-r-md"></div>}
              <item.icon size={18} className={isItemActive ? 'text-navy' : 'text-ink3'} />
              {item.label}
            </NavLink>
          );
        })}
        
        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-bb">
            <NavLink
              to="/admin"
              onClick={(e) => handleNavClick(e, '/admin')}
              className={() => {
                const isItemActive = location.pathname.startsWith('/admin');
                return clsx(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-md text-[13.5px] font-semibold transition-all duration-200 overflow-hidden',
                  isItemActive 
                    ? 'bg-red-bg text-red' 
                    : 'text-ink2 hover:bg-row-alt hover:text-red'
                );
              }}
            >
              {location.pathname.startsWith('/admin') && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red rounded-r-md"></div>}
              <ShieldAlert size={18} className={location.pathname.startsWith('/admin') ? 'text-red' : 'text-ink3'} />
              Super Admin
            </NavLink>
          </div>
        )}
      </nav>
      
      <div className="p-4 border-t border-bb mt-auto">
        <button 
          onClick={() => {
            if (isBillingDirty) {
              setPendingNavPath('/logout');
              if (onClose) onClose();
            } else {
              setShowLogout(true);
            }
          }}
          className="flex items-center w-full gap-3 px-3 py-2.5 rounded-md text-[13.5px] font-semibold text-red hover:bg-red-bg transition-colors"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-ink/40 z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-y-0 left-0 z-50 md:hidden no-print"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Static Sidebar */}
      <aside className="hidden md:block h-full z-10 relative no-print">
        {sidebarContent}
      </aside>

      <ConfirmDialog 
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={() => {
          setShowLogout(false);
          useUIStore.getState().reset();
          navigate('/');
          setTimeout(() => {
            logout();
          }, 50);
          if (onClose) onClose();
        }}
        title="Confirm Log Out"
        message="Are you sure you want to log out of your account?"
        confirmText="Log Out"
        confirmVariant="danger"
      />
    </>
  );
};
