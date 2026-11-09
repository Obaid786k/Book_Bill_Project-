import React from 'react';
import { numToWords } from '../../../utils/numToWords';
import { formatCurrency } from '../../../utils/gstCalc';
import { AutoTextarea } from '../../../components/common/AutoTextarea';

// Short invoices usually carry 3-6 terms; more than 6 gets cramped on one A4 page.
const MAX_TERMS = 6;
const BULLET = '• ';
const countPoints = (text = '') => text.split('\n').filter((l) => l.trim()).length;

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

      // Keeps lists going: "• text" -> new "• ", "1. text" -> "2. ". Enter on an empty point ends the list.
      const bullet = currentLine.match(/^•\s?(.*)$/);
      const match = bullet ? [null, null, bullet[1]] : currentLine.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        e.preventDefault();
        const number = bullet ? null : parseInt(match[1], 10);
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

        if (fieldKey === 'terms' && countPoints(value) >= MAX_TERMS) return; // limit reached
        const insertText = bullet ? `\n${BULLET}` : `\n${number + 1}. `;
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
            <AutoTextarea
              value={meta.terms}
              minHeight={68}
              onChange={(e) => onMetaChange('terms', e.target.value)}
              onKeyDown={(e) => handleListKeyDown(e, 'terms')}
              placeholder={`${BULLET}Goods once sold will not be taken back`}
              aria-label="Terms and conditions"
            />
            <div className="no-print" style={{ fontSize: '10px', marginTop: '2px', color: countPoints(meta.terms) > MAX_TERMS ? 'var(--red)' : 'var(--ink3)' }}>
              {countPoints(meta.terms)}/{MAX_TERMS} points{countPoints(meta.terms) > MAX_TERMS ? ' - keep it short so it fits the page' : ''}
            </div>
          </div>
          <div className="tn-col">
            <div className="tn-hdr">Notes</div>
            <AutoTextarea
              value={meta.notes}
              minHeight={68}
              onChange={(e) => onMetaChange('notes', e.target.value)}
              onKeyDown={(e) => handleListKeyDown(e, 'notes')}
              placeholder="Additional notes..."
              aria-label="Notes"
            />
          </div>
        </div>
      </div>
      <div className="bf-r">
        {totals.sumDisc > 0.004 && (
          <div className="tot-row">
            <span className="tl">Discount{gstOn && settings.priceMode === 'inclusive' ? ' (incl. GST)' : ''}</span>
            <span className="tv">−{formatCurrency(totals.sumDisc)}</span>
          </div>
        )}
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
