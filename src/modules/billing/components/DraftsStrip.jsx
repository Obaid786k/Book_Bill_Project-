import React from 'react';
import { FileText, X } from 'lucide-react';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-1';

// Recent drafts as chips. Click = restore (asks first), × = delete (asks first).
// Shown oldest -> newest, so a new (or just updated) draft appears at the right end.
export const DraftsStrip = ({ drafts, onRestore, onDelete }) => {
  if (!drafts || drafts.length === 0) return null;
  const ordered = [...drafts].reverse(); // service returns newest first

  return (
    <div className="no-print max-w-[960px] mx-auto mt-2 flex flex-wrap items-center gap-2">
      <span className="text-[12px] font-semibold text-ink2 mr-0.5">Drafts</span>
      {ordered.map((d) => (
        <span key={d.id} className="inline-flex items-center h-8 bg-paper border border-bb2 rounded-full text-[12.5px] font-medium text-ink2 hover:border-navy-300 transition-colors">
          <button
            type="button"
            onClick={() => onRestore(d.id)}
            title="Restore this draft"
            className={`inline-flex items-center gap-1.5 h-full pl-3 pr-1.5 rounded-l-full hover:text-navy ${FOCUS}`}
          >
            <FileText size={13} className="text-nav-icon" />
            <span className="max-w-[180px] truncate">{d.draftName}</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(d.id)}
            aria-label={`Delete draft ${d.draftName}`}
            title="Delete draft"
            className={`w-6 h-6 mr-1 rounded-full inline-flex items-center justify-center text-ink3 hover:bg-red-bg hover:text-red ${FOCUS}`}
          >
            <X size={13} />
          </button>
        </span>
      ))}
    </div>
  );
};
