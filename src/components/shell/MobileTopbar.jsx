import React, { useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { Avatar, ProfilePopover } from './ProfileRow';
import { useAuthStore } from '../../store/authStore';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2';

// Phone-only top bar (below md). Log out lives at the bottom of the menu drawer.
export const MobileTopbar = ({ onOpenMenu }) => {
  const user = useAuthStore((s) => s.user);
  const avatarRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="md:hidden h-14 shrink-0 bg-paper border-b border-bb2 flex items-center gap-1 px-1.5 no-print">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open menu"
        className={`w-11 h-11 flex items-center justify-center rounded-lg text-ink2 hover:bg-navy/[.06] ${FOCUS}`}
      >
        <Menu size={22} />
      </button>
      <div className="flex-1 flex items-center gap-2 font-bold text-navy text-[17px]">
        <span className="w-8 h-8 rounded-[8px] bg-gold text-white text-[15px] font-bold flex items-center justify-center" aria-hidden="true">₹</span>
        Bill Book
      </div>
      <NotificationBell placement="down" />
      <button
        type="button"
        ref={avatarRef}
        aria-label="Profile"
        aria-haspopup="dialog"
        aria-expanded={profileOpen}
        onClick={() => setProfileOpen((o) => !o)}
        className={`w-11 h-11 flex items-center justify-center rounded-lg hover:bg-navy/[.06] ${FOCUS}`}
      >
        <Avatar name={user?.name} src={user?.avatarUrl} />
      </button>
      <ProfilePopover isOpen={profileOpen} onClose={() => setProfileOpen(false)} anchorRef={avatarRef} placement="down" />
    </header>
  );
};
