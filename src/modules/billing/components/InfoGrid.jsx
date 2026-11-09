import React from 'react';
import { STATES } from '../../../utils/constants';
import { cleanGstin, isValidGstin } from '../../../utils/gstin';
import { AutoTextarea } from '../../../components/common/AutoTextarea';

// payStatus: 'Paid' | 'Pending' — saved as the bill's status (Pending bills get a due date).
// suggestions: remembered values from earlier bills (src/utils/recall.js) shown as dropdown hints.
export const InfoGrid = ({ customer, payment, settings, payStatus, onPayStatusChange, onCustomerChange, onPaymentChange, onSettingsChange, suggestions }) => {
  const custGstinBad = customer.custGstin && !isValidGstin(customer.custGstin);
  return (
    <div className="info-grid">
      {/* Suggestions from earlier bills (browser dropdown, screen only) */}
      <datalist id="recall-cust-name">{(suggestions?.customers || []).map(c => <option key={c.custName} value={c.custName} label={[c.custPhone, c.custState].filter(Boolean).join(' · ')} />)}</datalist>
      <datalist id="recall-cust-phone">{(suggestions?.custPhone || []).map(v => <option key={v} value={v} />)}</datalist>
      <datalist id="recall-cust-gstin">{(suggestions?.custGstin || []).map(v => <option key={v} value={v} />)}</datalist>
      <datalist id="recall-upi">{(suggestions?.upiId || []).map(v => <option key={v} value={v} />)}</datalist>
      <datalist id="recall-bank">{(suggestions?.bankAcc || []).map(v => <option key={v} value={v} />)}</datalist>
      <datalist id="recall-ifsc">{(suggestions?.ifsc || []).map(v => <option key={v} value={v} />)}</datalist>
      <div className="info-col">
        <div className="ic-hdr">Bill To</div>
        <div className="i-row">
          <span className="i-lbl">Name</span>
          <input 
            list="recall-cust-name" autoComplete="off" value={customer.custName} 
            onChange={(e) => onCustomerChange('custName', e.target.value)} 
            placeholder="Customer name" 
          />
        </div>
        <div className="i-row">
          <span className="i-lbl">Address</span>
          <AutoTextarea 
            value={customer.custAddress} 
            onChange={(e) => onCustomerChange('custAddress', e.target.value)} 
            placeholder="Address" 
          />
        </div>
        <div className="i-row">
          <span className="i-lbl">Phone</span>
          <input 
            list="recall-cust-phone" autoComplete="off" value={customer.custPhone} 
            onChange={(e) => onCustomerChange('custPhone', e.target.value)} 
            placeholder="Phone" 
          />
        </div>
        {settings.gstOn && (
          <div className="i-row gc">
            <span className="i-lbl">GSTIN</span>
            <input 
              list="recall-cust-gstin" autoComplete="off" value={customer.custGstin} 
              onChange={(e) => onCustomerChange('custGstin', cleanGstin(e.target.value))} 
              placeholder="Customer GSTIN (if any)" 
              maxLength={15}
              aria-invalid={!!custGstinBad}
              style={custGstinBad ? { color: 'var(--red)' } : undefined}
            />
            {custGstinBad && <span className="no-print" style={{ fontSize: '10px', color: 'var(--red)', whiteSpace: 'nowrap' }}>Check GSTIN</span>}
          </div>
        )}
        {settings.gstOn && (
          <div className="i-row gc">
            <span className="i-lbl">State</span>
            <select 
              value={customer.custState} 
              onChange={(e) => onCustomerChange('custState', e.target.value)}
            >
              <option value="">Select State</option>
              {STATES.map(s => <option key={s.c} value={s.n}>{s.n}</option>)}
            </select>
          </div>
        )}
      </div>
      <div className="info-col">
        <div className="ic-hdr">Payment Details</div>
        <div className="i-row">
          <span className="i-lbl">Mode</span>
          <select 
            value={payment.payMode} 
            onChange={(e) => onPaymentChange('payMode', e.target.value)}
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
            <option>Bank Transfer</option>
            <option>Cheque</option>
          </select>
        </div>
        <div className="i-row">
          <span className="i-lbl">Status</span>
          <select
            value={payStatus}
            onChange={(e) => onPayStatusChange(e.target.value)}
            aria-label="Payment status"
          >
            <option value="Paid">Paid</option>
            <option value="Pending">Pending (to be collected)</option>
          </select>
        </div>
        {payment.payMode === 'UPI' && (
          <div className="i-row">
            <span className="i-lbl">UPI ID</span>
            <input 
              list="recall-upi" autoComplete="off" value={payment.upiId} 
              onChange={(e) => onPaymentChange('upiId', e.target.value)} 
              placeholder="shopname@upi" 
            />
          </div>
        )}
        {payment.payMode === 'Bank Transfer' && (
          <>
            <div className="i-row">
              <span className="i-lbl">Bank / A/C</span>
              <input 
                list="recall-bank" autoComplete="off" value={payment.bankAcc} 
                onChange={(e) => onPaymentChange('bankAcc', e.target.value)} 
                placeholder="Bank name, A/C no." 
              />
            </div>
            <div className="i-row">
              <span className="i-lbl">IFSC</span>
              <input 
                list="recall-ifsc" autoComplete="off" value={payment.ifsc} 
                onChange={(e) => onPaymentChange('ifsc', e.target.value)} 
                placeholder="IFSC code" 
              />
            </div>
          </>
        )}
        {settings.gstOn && (
          <div className="i-row gc">
            <span className="i-lbl" title="E-Way Bill number: needed when goods worth more than ₹50,000 are moved by vehicle. Leave empty otherwise.">E-Way Bill</span>
            <input 
              value={settings.ewayBill} 
              onChange={(e) => onSettingsChange('ewayBill', e.target.value)} 
              placeholder="(if applicable)" 
            />
          </div>
        )}
        {settings.gstOn && (
          <div className="i-row gc">
            <span className="i-lbl" title="Reverse charge: Yes only when the BUYER pays the GST to the government instead of you (special services like GTA transport, legal or import of services). Almost always No.">Reverse Chg.</span>
            <select 
              value={settings.rcm} 
              onChange={(e) => onSettingsChange('rcm', e.target.value)}
            >
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
