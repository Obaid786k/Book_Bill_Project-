import React from 'react';

export const DraftsStrip = ({ drafts, onRestore, onDelete }) => {
  if (!drafts || drafts.length === 0) return null;

  return (
    <div className="drafts-strip no-print">
      <span className="d-label">📋 Drafts</span>
      <div id="draftPills">
        {drafts.map((d, i) => (
          <span key={i} className="d-pill" onClick={() => onRestore(i)}>
            📄 {d.draftName}
            <span 
              className="d-pill-x" 
              onClick={(e) => { e.stopPropagation(); onDelete(i); }}
            >
              ✕
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};
