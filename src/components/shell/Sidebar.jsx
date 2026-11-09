import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, PanelLeftClose, PanelLeftOpen, X, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import { NAV, ADMIN_NAV } from '../../config/navigation';
import { useGuardedNavigate } from '../../hooks/useGuardedNavigate';
import { useDraftsQuery } from '../../hooks/useAlerts';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { ComingSoonBadge } from '../common/ComingSoonBadge';
import { NotificationBell } from './NotificationBell';
import { ProfileRow } from './ProfileRow';
import { preloadRoute } from '../../routes/pages';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2';

const isChildActive = (child, pathname) =>
  !child.external && (child.end ? pathname === child.path : pathname === child.path || pathname.startsWith(child.path + '/'));

const isGroupActive = (item, pathname) =>
  item.children ? pathname === item.base || pathname.startsWith(item.base + '/') : pathname === item.path;

const activeGroupKey = (pathname) => NAV.find((i) => i.children && isGroupActive(i, pathname))?.key ?? null;

// Selected marker (same as the first version): a full-height line on the left edge.
// The row is rounded + overflow-hidden, so the line curves in and thins out at both ends.
// gold = module, navy = sub-page, red = Super admin.
const ActiveBar = ({ tone = 'gold' }) => (
  <span
    aria-hidden="true"
    className={clsx('absolute left-0 top-0 bottom-0 rounded-r-md', { gold: 'bg-gold w-1', navy: 'bg-navy w-[3px]', red: 'bg-red w-1' }[tone])}
  />
);

const Brand = () => (
  <span className="w-8 h-8 shrink-0 rounded-[8px] bg-gold text-white text-[15px] font-bold flex items-center justify-center" aria-hidden="true">₹</span>
);

// mode 'desktop' = fixed column (md and up), 'drawer' = inside the phone slide-in drawer.
export const Sidebar = ({ mode = 'desktop', onNavigate }) => {
  const { pathname } = useLocation();
  const { go } = useGuardedNavigate();
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1279px)');
  const rail = mode === 'desktop' && isTablet && sidebarCollapsed;
  const draftCount = useDraftsQuery().data?.length || 0;
  const badges = { drafts: draftCount };

  // Accordion: one group open at a time; the current route's group opens on navigation.
  const [openKey, setOpenKey] = useState(() => activeGroupKey(pathname));
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpenKey(activeGroupKey(pathname));
  }
  // The gold line follows the module the user just clicked (open group);
  // with nothing open it marks the module of the current page.
  const routeKey = NAV.find((i) => isGroupActive(i, pathname))?.key ?? null;
  const selectedKey = openKey ?? routeKey;

  const navTo = (e, path) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // new tab / window
    e.preventDefault();
    onNavigate?.();
    if (path !== pathname) go(path);
  };

  const touch = mode === 'drawer'; // 44px+ touch targets on phones
  const rowBase = clsx(
    'relative overflow-hidden w-full h-11 flex items-center gap-3 rounded-lg text-[15px] transition-colors', FOCUS,
    rail ? 'justify-center px-0' : 'px-3'
  );

  const renderItem = (item) => {
    const active = selectedKey === item.key;
    const Icon = item.icon;
    const iconEl = <Icon size={20} className={active ? 'text-navy-lt' : 'text-nav-icon'} />;
    const labelCls = active ? 'text-navy font-semibold' : 'text-ink2 font-medium';

    if (!item.children) {
      return (
        <NavLink
          key={item.key}
          to={item.path}
          onClick={(e) => { setOpenKey(null); navTo(e, item.path); }}
          onMouseEnter={() => preloadRoute(item.path)}
          onFocus={() => preloadRoute(item.path)}
          title={rail ? item.label : undefined}
          aria-label={rail ? item.label : undefined}
          className={clsx(rowBase, active ? 'bg-navy/[.08]' : 'hover:bg-navy/[.06]')}
        >
          {active && <ActiveBar />}
          {iconEl}
          {!rail && <span className={labelCls}>{item.label}</span>}
        </NavLink>
      );
    }

    const isOpen = !rail && openKey === item.key;
    return (
      <div key={item.key}>
        <button
          type="button"
          aria-expanded={isOpen}
          title={rail ? item.label : undefined}
          aria-label={rail ? item.label : undefined}
          onClick={() => {
            if (rail) { setSidebarCollapsed(false); setOpenKey(item.key); return; }
            setOpenKey(isOpen ? null : item.key);
          }}
          className={clsx(rowBase, active ? 'bg-navy/[.08]' : 'hover:bg-navy/[.06]')}
        >
          {active && <ActiveBar />}
          {iconEl}
          {!rail && (
            <>
              <span className={clsx('flex-1 text-left', labelCls)}>{item.label}</span>
              {isOpen ? <ChevronUp size={17} className="text-ink2" /> : <ChevronDown size={17} className="text-ink2" />}
            </>
          )}
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="ml-[21px] pl-3 border-l border-bb2 flex flex-col gap-0.5 py-1">
                {item.children.map((child) => {
                  const cActive = isChildActive(child, pathname);
                  const CIcon = child.icon;
                  const badge = child.badgeKey ? badges[child.badgeKey] : 0;
                  const cls = clsx(
                    'relative overflow-hidden px-2.5 flex items-center rounded-[8px] text-[14px] transition-colors', FOCUS,
                    touch ? 'h-11' : 'h-10',
                    cActive ? 'bg-navy/[.08] text-navy font-semibold' : 'text-ink2 font-medium hover:bg-navy/[.06]'
                  );
                  const inner = (
                    <>
                      {cActive && <ActiveBar tone="navy" />}
                      <CIcon size={18} className={clsx('mr-2.5 shrink-0', cActive ? 'text-navy-lt' : 'text-nav-icon')} />
                      <span className="flex-1 truncate">{child.label}</span>
                      {badge > 0 && (
                        <span className="ml-2 min-w-[22px] h-5 px-1.5 rounded-full bg-bb2 text-ink2 text-[11.5px] font-semibold leading-5 text-center">{badge}</span>
                      )}
                      {child.comingSoon && <ComingSoonBadge className="ml-2" />}
                      {child.external && <ExternalLink size={13} className="ml-2 text-ink3" />}
                    </>
                  );
                  if (child.external) {
                    return (
                      <a key={child.label} href={child.href} target="_blank" rel="noopener noreferrer" className={cls} onClick={() => onNavigate?.()}>
                        {inner}
                      </a>
                    );
                  }
                  return (
                    <NavLink key={child.path} to={child.path} end={child.end} onClick={(e) => navTo(e, child.path)}
          onMouseEnter={() => preloadRoute(child.path)}
          onFocus={() => preloadRoute(child.path)} className={cls}>
                      {inner}
                    </NavLink>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const adminActive = pathname.startsWith(ADMIN_NAV.path);
  const AdminIcon = ADMIN_NAV.icon;

  return (
    <div
      className={clsx(
        'h-full flex flex-col gap-4 bg-paper border-r border-bb2 transition-[width] duration-150',
        rail ? 'w-[72px] px-2.5 py-4' : 'w-[272px] px-3 py-4'
      )}
    >
      {/* Header */}
      {rail ? (
        <div className="flex flex-col items-center gap-2">
          <Brand />
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className={clsx('w-10 h-10 rounded-lg flex items-center justify-center text-ink2 hover:bg-navy/[.06]', FOCUS)}
          >
            <PanelLeftOpen size={19} />
          </button>
          <NotificationBell />
        </div>
      ) : (
        <div className="flex items-center justify-between pl-1">
          <div className="flex items-center gap-2.5">
            <Brand />
            <span className="text-[18px] font-bold text-navy">Bill Book</span>
          </div>
          <div className="flex items-center">
            {mode === 'drawer' ? (
              <button
                type="button"
                onClick={onNavigate}
                aria-label="Close menu"
                className={clsx('w-11 h-11 rounded-lg flex items-center justify-center text-ink2 hover:bg-navy/[.06]', FOCUS)}
              >
                <X size={20} />
              </button>
            ) : (
              <>
                {isTablet && (
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(true)}
                    aria-label="Collapse sidebar"
                    title="Collapse sidebar"
                    className={clsx('w-10 h-10 rounded-lg flex items-center justify-center text-ink2 hover:bg-navy/[.06]', FOCUS)}
                  >
                    <PanelLeftClose size={19} />
                  </button>
                )}
                <NotificationBell />
              </>
            )}
          </div>
        </div>
      )}

      {/* Main nav */}
      <nav aria-label="Main" className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1 -mx-1 px-1">
        {NAV.map(renderItem)}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col gap-2">
        {isAdmin && (
          <NavLink
            to={ADMIN_NAV.path}
            onClick={(e) => navTo(e, ADMIN_NAV.path)}
          onMouseEnter={() => preloadRoute(ADMIN_NAV.path)}
          onFocus={() => preloadRoute(ADMIN_NAV.path)}
            title={rail ? ADMIN_NAV.label : undefined}
            aria-label={rail ? ADMIN_NAV.label : undefined}
            className={clsx(rowBase, 'text-navy-900 font-bold', adminActive ? 'bg-red-bg' : 'hover:bg-navy/[.06]')}
          >
            {adminActive && <ActiveBar tone="red" />}
            <AdminIcon size={20} strokeWidth={2.2} className={adminActive ? 'text-red' : 'text-navy-900'} />
            {!rail && ADMIN_NAV.label}
          </NavLink>
        )}
        <ProfileRow compact={rail} />
      </div>
    </div>
  );
};
