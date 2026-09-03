import React from 'react';

export const DraftsStrip = ({ drafts, onRestore, onDelete }) => {
  if (!drafts || drafts.length === 0) return null;

  return (
    <div className="drafts-strip no-print">
      <span className="d-label">📋 Drafts</span>
      <div id="draftPills">
        {drafts.map((d) => (
          <span key={d.id} className="d-pill" onClick={() => onRestore(d.id)}>
            📄 {d.draftName}
            <span 
              className="d-pill-x" 
              onClick={(e) => { e.stopPropagation(); onDelete(d.id); }}
            >
              ✕
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};
