import React from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { getRouteMeta } from '../../config/navigation';
import { useGuardedNavigate } from '../../hooks/useGuardedNavigate';

// Back = the app's primary (gold) button with a label, so it is easy to spot on every page.
export const BackButton = ({ className }) => {
  const { goBack } = useGuardedNavigate();
  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Go back"
      className={clsx(
        'h-10 shrink-0 inline-flex items-center gap-1.5 pl-2.5 pr-3.5 rounded-lg bg-gold text-white text-[13.5px] font-semibold',
        'shadow-[0_1px_2px_rgba(180,83,9,0.25)] hover:opacity-90 active:scale-[0.97] transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2',
        className
      )}
    >
      <ArrowLeft size={18} strokeWidth={2.4} />
      Back
    </button>
  );
};

// Same header on every logged-in page.
// title / eyebrow default from navigation.js. title may be a node (New bill's editable name).
// actions order: ghost -> outline -> ONE primary at the far right.
export const PageHeader = ({ title, eyebrow, actions, meta, showBack = true, className }) => {
  const { pathname } = useLocation();
  const routeMeta = getRouteMeta(pathname);
  const t = title ?? routeMeta.title;
  const e = eyebrow === undefined ? routeMeta.eyebrow : eyebrow;

  return (
    <div className={clsx('flex flex-wrap items-center justify-between gap-x-4 gap-y-3 mb-5 no-print', className)}>
      <div className="flex items-center gap-3.5 min-w-0">
        {showBack && <BackButton />}
        {showBack && <span className="hidden sm:block w-px h-9 bg-bb" aria-hidden="true" />}
        <div className="min-w-0">
          {e && <div className="text-[12.5px] font-medium text-ink2 leading-tight mb-0.5">{e}</div>}
          {typeof t === 'string'
            ? <h1 className="text-[19px] md:text-[24px] font-bold text-navy-900 leading-tight truncate">{t}</h1>
            : t}
          {meta && <div className="mt-1">{meta}</div>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
};
