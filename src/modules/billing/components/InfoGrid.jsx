import React from 'react';
import { STATES } from '../../../utils/constants';

export const InfoGrid = ({ customer, payment, settings, onCustomerChange, onPaymentChange, onSettingsChange }) => {
  return (
    <div className="info-grid">
      <div className="info-col">
        <div className="ic-hdr">Bill To</div>
        <div className="i-row">
          <span className="i-lbl">Name</span>
          <input 
            value={customer.custName} 
            onChange={(e) => onCustomerChange('custName', e.target.value)} 
            placeholder="Customer name" 
          />
        </div>
        <div className="i-row">
          <span className="i-lbl">Address</span>
          <textarea 
            value={customer.custAddress} 
            onChange={(e) => onCustomerChange('custAddress', e.target.value)} 
            placeholder="Address" 
          />
        </div>
        <div className="i-row">
          <span className="i-lbl">Phone</span>
          <input 
            value={customer.custPhone} 
            onChange={(e) => onCustomerChange('custPhone', e.target.value)} 
            placeholder="Phone" 
          />
        </div>
        {settings.gstOn && (
          <div className="i-row gc">
            <span className="i-lbl">GSTIN</span>
            <input 
              value={customer.custGstin} 
              onChange={(e) => onCustomerChange('custGstin', e.target.value)} 
              placeholder="Customer GSTIN (if any)" 
            />
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
        {payment.payMode === 'UPI' && (
          <div className="i-row">
            <span className="i-lbl">UPI ID</span>
            <input 
              value={payment.upiId} 
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
                value={payment.bankAcc} 
                onChange={(e) => onPaymentChange('bankAcc', e.target.value)} 
                placeholder="Bank name, A/C no." 
              />
            </div>
            <div className="i-row">
              <span className="i-lbl">IFSC</span>
              <input 
                value={payment.ifsc} 
                onChange={(e) => onPaymentChange('ifsc', e.target.value)} 
                placeholder="IFSC code" 
              />
            </div>
          </>
        )}
        {settings.gstOn && (
          <div className="i-row gc">
            <span className="i-lbl">E-Way Bill</span>
            <input 
              value={settings.ewayBill} 
              onChange={(e) => onSettingsChange('ewayBill', e.target.value)} 
              placeholder="(if applicable)" 
            />
          </div>
        )}
        {settings.gstOn && (
          <div className="i-row gc">
            <span className="i-lbl">Reverse Chg.</span>
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
