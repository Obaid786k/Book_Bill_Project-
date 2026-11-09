import React, { useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { clsx } from 'clsx';
import { Popover } from '../common/Popover';
import { AlertList } from './AlertList';
import { useAlerts, useAlertReadStore } from '../../hooks/useAlerts';
import { useGuardedNavigate } from '../../hooks/useGuardedNavigate';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2';

// placement 'side' = opens beside the sidebar (desktop), 'down' = full width under the mobile top bar.
export const NotificationBell = ({ placement = 'side' }) => {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('all');
  const { alerts, unreadCount } = useAlerts();
  const markRead = useAlertReadStore((s) => s.markRead);
  const { go } = useGuardedNavigate();

  const close = () => setOpen(false);
  const shown = tab === 'unread' ? alerts.filter((a) => a.unread) : alerts;

  const footerLink = (path, label) => (
    <button type="button" onClick={() => { close(); go(path); }} className={clsx('text-[12.5px] font-semibold text-navy hover:underline rounded', FOCUS)}>
      {label}
    </button>
  );

  return (
    <div className={placement === 'side' ? 'relative' : ''}>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={open}
        className={clsx('relative w-10 h-10 rounded-lg flex items-center justify-center text-ink2 hover:bg-navy/[.06] transition-colors', FOCUS)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red text-white text-[10px] font-bold leading-4 text-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <Popover
        isOpen={open}
        onClose={close}
        anchorRef={anchorRef}
        label="Notifications"
        className={placement === 'side'
          ? 'absolute top-0 left-[calc(100%+8px)] w-[380px] max-w-[calc(100vw-280px)]'
          : 'fixed left-2 right-2 top-[60px] max-h-[75vh] overflow-y-auto'}
      >
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
          <h2 className="text-[15px] font-bold text-navy-900">Notifications</h2>
          {unreadCount > 0 && (
            <button type="button" onClick={() => markRead(alerts.map((a) => a.id))} className={clsx('text-[12.5px] font-semibold text-navy hover:underline rounded', FOCUS)}>
              Mark all as read
            </button>
          )}
        </div>
        <div className="flex gap-2 px-4 pb-3 border-b border-bb2" role="tablist">
          {[['all', 'All'], ['unread', `Unread · ${unreadCount}`]].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={clsx(
                'h-7 px-3 rounded-full text-[12px] font-semibold border transition-colors', FOCUS,
                tab === key ? 'bg-navy text-white border-navy' : 'bg-paper text-ink2 border-bb hover:bg-row-alt'
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="max-h-[360px] overflow-y-auto">
          <AlertList alerts={shown} onNavigate={close} />
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-bb2">
          {footerLink('/notifications', 'View all')}
          {footerLink('/settings/notifications', 'Notification settings')}
        </div>
      </Popover>
    </div>
  );
};
