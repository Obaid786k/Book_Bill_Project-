import React from 'react';
import { numToWords } from '../../../utils/numToWords';
import { formatCurrency } from '../../../utils/gstCalc';

export const BillFoot = ({ totals, settings, meta, onMetaChange }) => {
  const { gstOn, tt } = settings;
  const isPositive = totals.roundOff >= 0;

  const handleListKeyDown = (e, fieldKey) => {
    if (e.key === 'Enter') {
      const el = e.target;
      const { value, selectionStart, selectionEnd } = el;
      if (selectionStart !== selectionEnd) return;

      const textBefore = value.substring(0, selectionStart);
      const lines = textBefore.split('\n');
      const currentLine = lines[lines.length - 1];

      const match = currentLine.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        e.preventDefault();
        const number = parseInt(match[1], 10);
        const text = match[2];

        if (text.trim() === '') {
          const newTextBefore = textBefore.substring(0, textBefore.length - currentLine.length);
          const newText = newTextBefore + value.substring(selectionStart);
          onMetaChange(fieldKey, newText);
          setTimeout(() => {
            el.selectionStart = el.selectionEnd = newTextBefore.length;
          }, 0);
          return;
        }

        const insertText = `\n${number + 1}. `;
        const newTextBefore = textBefore + insertText;
        const newText = newTextBefore + value.substring(selectionStart);
        onMetaChange(fieldKey, newText);
        setTimeout(() => {
          el.selectionStart = el.selectionEnd = newTextBefore.length;
        }, 0);
      }
    }
  };

  return (
    <div className="bill-foot">
      <div className="bf-l">
        <div className="words-box" style={{ marginTop: 0, marginBottom: '9px' }}>
          Amount in words: <b>Rupees {numToWords(totals.grand)} Only</b>
        </div>
        <div className="tn-wrap">
          <div className="tn-col">
            <div className="tn-hdr">Terms & Conditions</div>
            <textarea 
              value={meta.terms} 
              onChange={(e) => onMetaChange('terms', e.target.value)} 
              onKeyDown={(e) => handleListKeyDown(e, 'terms')}
            />
          </div>
          <div className="tn-col">
            <div className="tn-hdr">Notes</div>
            <textarea 
              value={meta.notes} 
              onChange={(e) => onMetaChange('notes', e.target.value)} 
              onKeyDown={(e) => handleListKeyDown(e, 'notes')}
              placeholder="Additional notes..." 
            />
          </div>
        </div>
      </div>
      <div className="bf-r">
        <div className="tot-row">
          <span className="tl">{gstOn ? "Taxable Value" : "Subtotal"}</span>
          <span className="tv">{formatCurrency(totals.sumAmt)}</span>
        </div>
        
        {gstOn && tt === 'intra' && (
          <>
            <div className="tot-row gc intra">
              <span className="tl">Total CGST</span>
              <span className="tv">{formatCurrency(totals.sumCgst)}</span>
            </div>
            <div className="tot-row gc intra">
              <span className="tl">Total SGST</span>
              <span className="tv">{formatCurrency(totals.sumSgst)}</span>
            </div>
          </>
        )}
        
        {gstOn && tt === 'inter' && (
          <div className="tot-row gc inter">
            <span className="tl">Total IGST</span>
            <span className="tv">{formatCurrency(totals.sumIgst)}</span>
          </div>
        )}
        
        <div className="tot-row">
          <span className="tl">Round Off</span>
          <span className="tv">
            {isPositive ? "+₹" : "−₹"}{Math.abs(totals.roundOff).toFixed(2)}
          </span>
        </div>
        <div className="tot-grand">
          <span className="tl">Grand Total</span>
          <span className="tv">{formatCurrency(totals.grand)}</span>
        </div>
      </div>
    </div>
  );
};
