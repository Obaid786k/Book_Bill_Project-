import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';

// Small headless popover: closes on outside click and Esc, focuses the first
// item when opened and returns focus to the trigger when closed.
// The parent positions it (className) — usually `absolute` inside a `relative` wrapper.
export const Popover = ({ isOpen, onClose, anchorRef, className, children, role = 'dialog', label }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const anchor = anchorRef?.current;

    const first = panelRef.current?.querySelector(
      'a[href], button:not([disabled]), input:not([disabled]), select, [tabindex]:not([tabindex="-1"])'
    );
    first?.focus();

    const onDown = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (anchor?.contains(e.target)) return; // trigger toggles itself
      onClose();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        anchor?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;
  return (
    <div
      ref={panelRef}
      role={role}
      aria-label={label}
      className={clsx(
        'z-50 bg-paper border border-bb2 rounded-[12px] shadow-[0_8px_24px_rgba(15,28,46,.12)] animate-fade-in',
        className
      )}
    >
      {children}
    </div>
  );
};
