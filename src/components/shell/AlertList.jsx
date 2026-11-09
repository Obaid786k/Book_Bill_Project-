import React from 'react';
import { AlertCircle, FileText, Info, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useGuardedNavigate } from '../../hooks/useGuardedNavigate';
import { useAlertReadStore } from '../../hooks/useAlerts';

const ICONS = {
  overdue: { Icon: AlertCircle, cls: 'text-red' },
  drafts: { Icon: FileText, cls: 'text-ink2' },
  profile: { Icon: Info, cls: 'text-gold' },
};

// One list used by the bell panel, the dashboard and the notifications page.
// variant 'panel' = full rows (icon + text + sub), 'compact' = one line + short link.
export const AlertList = ({ alerts, variant = 'panel', onNavigate, emptyText = "You're all caught up" }) => {
  const { go } = useGuardedNavigate();
  const markRead = useAlertReadStore((s) => s.markRead);

  if (!alerts.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <CheckCircle2 size={22} className="text-green" />
        <p className="text-[13px] font-medium text-ink2">{emptyText}</p>
      </div>
    );
  }

  const open = (a) => {
    markRead([a.id]);
    onNavigate?.();
    go(a.link);
  };

  return (
    <ul className="divide-y divide-bb2">
      {alerts.map((a) => {
        const { Icon, cls } = ICONS[a.type] || ICONS.profile;
        if (variant === 'compact') {
          return (
            <li key={a.id} className="flex items-center gap-3 py-2.5">
              <Icon size={16} className={clsx('shrink-0', cls)} />
              <span className="flex-1 min-w-0 text-[13px] text-ink truncate">{a.text}</span>
              <button
                type="button"
                onClick={() => open(a)}
                className="shrink-0 text-[13px] font-semibold text-ink hover:text-navy rounded px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
              >
                {a.linkLabel}
              </button>
            </li>
          );
        }
        return (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => open(a)}
              className={clsx(
                'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-row-alt transition-colors focus-visible:outline-none focus-visible:bg-row-alt',
                a.unread && 'bg-navy/[.03]'
              )}
            >
              <span className="w-8 h-8 shrink-0 rounded-lg bg-row-alt flex items-center justify-center">
                <Icon size={16} className={cls} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-semibold text-ink">{a.text}</span>
                {a.sub && <span className="block text-[12px] text-ink2 mt-0.5">{a.sub}</span>}
              </span>
              {a.unread && <span className="w-2 h-2 rounded-full bg-navy mt-1.5 shrink-0" aria-label="Unread" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
};
