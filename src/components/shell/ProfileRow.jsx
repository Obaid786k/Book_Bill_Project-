import React, { useRef, useState } from 'react';
import { LogOut, Mail, Store, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { Popover } from '../common/Popover';
import { useAuthStore } from '../../store/authStore';
import { useAlerts } from '../../hooks/useAlerts';
import { initialsOf, requestLogout } from './shellActions';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2';

// Profile photo if the user has one (uploaded, or from Google), otherwise initials.
export const Avatar = ({ name, src, size = 32 }) => {
  const [failedSrc, setFailedSrc] = useState(null);
  const showImg = src && failedSrc !== src;
  return (
    <span
      className="shrink-0 rounded-full bg-gold text-white font-bold flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size, fontSize: Math.max(12, Math.round(size * 0.36)) }}
      aria-hidden="true"
    >
      {showImg
        ? <img src={src} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={() => setFailedSrc(src)} />
        : initialsOf(name)}
    </span>
  );
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 px-4 py-2.5">
    <Icon size={16} className="text-nav-icon mt-0.5 shrink-0" />
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-ink2 uppercase tracking-wide">{label}</p>
      <p className="text-[13px] text-ink break-all">{value}</p>
    </div>
  </div>
);

// Same kind of panel as notifications: photo, name, email, business — and Log out.
// placement 'up' = above the sidebar row, 'down' = under the phone top bar.
export const ProfilePopover = ({ isOpen, onClose, anchorRef, placement = 'up' }) => {
  const user = useAuthStore((s) => s.user);
  const { shopProfile } = useAlerts();

  return (
    <Popover
      isOpen={isOpen}
      onClose={onClose}
      anchorRef={anchorRef}
      label="Profile"
      className={placement === 'up'
        ? 'absolute bottom-[calc(100%+8px)] left-0 w-[300px]'
        : 'fixed left-2 right-2 top-[60px]'}
    >
      <div className="flex flex-col items-center text-center px-4 pt-5 pb-4 border-b border-bb2">
        <Avatar name={user?.name} src={user?.avatarUrl} size={72} />
        <p className="mt-2.5 text-[16px] font-bold text-navy-900 break-all">{user?.name || 'User'}</p>
        <p className="text-[12.5px] text-ink2 break-all">{user?.email}</p>
      </div>
      <div className="py-1.5">
        <DetailRow icon={Mail} label="Login email" value={user?.email || '—'} />
        {user?.pendingEmail && <DetailRow icon={Clock} label="Waiting for confirmation" value={user.pendingEmail} />}
        <DetailRow icon={Store} label="Business" value={shopProfile?.shopName || 'Not set yet'} />
      </div>
      <div className="p-2 border-t border-bb2">
        <button
          type="button"
          onClick={() => { onClose(); requestLogout(); }}
          className={clsx('w-full h-10 flex items-center justify-center gap-2 rounded-lg text-red text-[13.5px] font-bold hover:bg-red-bg transition-colors', FOCUS)}
        >
          <LogOut size={17} strokeWidth={2.4} /> Log out
        </button>
      </div>
    </Popover>
  );
};

// Bottom of the sidebar: avatar + name (opens the profile panel) and Log out.
export const ProfileRow = ({ compact = false }) => {
  const user = useAuthStore((s) => s.user);
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((o) => !o);

  return (
    <div className="relative border-t border-divider pt-3">
      {compact ? (
        <div className="flex flex-col items-center gap-1">
          <button ref={anchorRef} type="button" onClick={toggle} aria-label="Profile" aria-haspopup="dialog" aria-expanded={open} title={user?.name}
            className={clsx('w-12 h-12 flex items-center justify-center rounded-[10px] hover:bg-navy/[.06]', open && 'bg-navy/[.08]', FOCUS)}>
            <Avatar name={user?.name} src={user?.avatarUrl} size={34} />
          </button>
          <button type="button" onClick={requestLogout} aria-label="Log out" title="Log out"
            className={clsx('w-12 h-10 flex items-center justify-center rounded-[10px] text-red hover:bg-red-bg', FOCUS)}>
            <LogOut size={19} strokeWidth={2.4} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <button
            ref={anchorRef}
            type="button"
            onClick={toggle}
            aria-label="Profile"
            aria-haspopup="dialog"
            aria-expanded={open}
            className={clsx('flex-1 min-w-0 h-12 pl-2 pr-2.5 flex items-center gap-2.5 rounded-[10px] hover:bg-navy/[.06] transition-colors', open && 'bg-navy/[.08]', FOCUS)}
          >
            <Avatar name={user?.name} src={user?.avatarUrl} size={34} />
            <span className="text-[15px] font-bold text-navy-900 truncate">{user?.name || 'User'}</span>
          </button>
          <button
            type="button"
            onClick={requestLogout}
            className={clsx('flex-none h-12 px-2 flex items-center gap-1.5 rounded-[10px] whitespace-nowrap text-red text-[13.5px] font-bold hover:bg-red-bg transition-colors', FOCUS)}
          >
            <LogOut size={18} strokeWidth={2.4} />
            Log out
          </button>
        </div>
      )}
      <ProfilePopover isOpen={open} onClose={() => setOpen(false)} anchorRef={anchorRef} />
    </div>
  );
};
