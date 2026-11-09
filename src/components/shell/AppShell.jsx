import React, { Suspense, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { MobileTopbar } from './MobileTopbar';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { preloadAppPages } from '../../routes/pages';

// The ONE layout for every logged-in page (except Super admin).
const AppShell = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { logoutConfirmOpen, setLogoutConfirmOpen } = useUIStore();

  // Download the other app pages in the background once the browser is idle.
  useEffect(() => { preloadAppPages(); }, []);

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      useUIStore.getState().reset();
      await logout();
      setLogoutConfirmOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="h-screen flex bg-bg font-body text-ink print:block print:h-auto print:bg-white">
      {/* Desktop / tablet sidebar */}
      <aside className="hidden md:block h-full shrink-0 relative z-20 no-print">
        <Sidebar mode="desktop" />
      </aside>

      {/* Phone drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-ink/40 z-40 md:hidden no-print"
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-y-0 left-0 z-50 md:hidden no-print shadow-xl"
            >
              <Sidebar mode="drawer" onNavigate={() => setIsDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        <MobileTopbar onOpenMenu={() => setIsDrawerOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden print:overflow-visible">
          <div className="max-w-[1480px] mx-auto px-4 md:px-6 xl:px-10 py-6 print:p-0 print:max-w-none">
            {/* Sidebar stays visible while a page's code arrives (usually already preloaded). */}
            <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      <ConfirmDialog
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={confirmLogout}
        title="Log out?"
        message="You will need to sign in again to use Bill Book."
        confirmText="Log out"
        cancelText="Stay"
        confirmVariant="danger"
        isLoading={loggingOut}
      />
    </div>
  );
};

export default AppShell;
