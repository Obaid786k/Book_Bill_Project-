import React from 'react';
import { getStCode } from '../../../utils/constants';

export const PosBar = ({ settings, shopState, custState }) => {
  if (!settings.gstOn) return null;

  const pos = custState || shopState;
  const posCode = getStCode(pos);
  const typeText = settings.tt === 'intra' ? "Intra-State (CGST + SGST)" : "Inter-State (IGST)";

  return (
    <div className="pos-bar gc">
      <div className="pitem">
        <span className="pos-lbl">Place of Supply:</span>
        <span className="pos-val">{pos}</span>
        {posCode && <span className="pos-code">{posCode}</span>}
      </div>
      <span style={{ color: 'var(--border)', fontSize: '14px' }}>|</span>
      <div className="pitem">
        <span className="pos-lbl">Supply Type:</span>
        <span className="pos-type">{typeText}</span>
      </div>
    </div>
  );
};
