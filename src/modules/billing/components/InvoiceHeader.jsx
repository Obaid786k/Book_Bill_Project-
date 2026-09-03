import React from 'react';
import { STATES } from '../../../utils/constants';
import { Calendar } from 'lucide-react';

export const InvoiceHeader = ({ shop, meta, settings, onShopChange, onMetaChange }) => {
  return (
    <div className="inv-hd">
      <div className="inv-hd-l">
        <input 
          className="co-name" 
          value={shop.shopName} 
          onChange={(e) => onShopChange('shopName', e.target.value)} 
          placeholder="Business / Shop Name" 
        />
        <input 
          className="co-tagline" 
          value={shop.tagline} 
          onChange={(e) => onShopChange('tagline', e.target.value)} 
          placeholder="Tagline (optional)" 
        />
        <div className="co-meta">
          <div className="co-row">
            <span className="ci">📍</span>
            <textarea 
              value={shop.shopAddress} 
              onChange={(e) => onShopChange('shopAddress', e.target.value)} 
              placeholder="Address"
            />
          </div>
          <div className="co-row">
            <span className="ci">📞</span>
            <input 
              value={shop.shopPhone} 
              onChange={(e) => onShopChange('shopPhone', e.target.value)} 
              placeholder="Phone" 
            />
          </div>
          <div className="co-row">
            <span className="ci">✉</span>
            <input 
              value={shop.shopEmail} 
              onChange={(e) => onShopChange('shopEmail', e.target.value)} 
              placeholder="Email" 
            />
          </div>
          {settings.gstOn && (
            <div className="co-row gc">
              <span className="ci">🧾</span>
              <input 
                value={shop.shopGstin} 
                onChange={(e) => onShopChange('shopGstin', e.target.value)} 
                placeholder="GSTIN (15 digits)" 
              />
            </div>
          )}
          <div className="co-row">
            <span className="ci">🗺</span>
            <select 
              value={shop.shopState} 
              onChange={(e) => onShopChange('shopState', e.target.value)}
            >
              {STATES.map(s => <option key={s.c} value={s.n}>{s.n}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="inv-hd-r">
        <div className="doc-lbl">{settings.gstOn ? "TAX INVOICE" : "CASH MEMO"}</div>
        <div className="doc-sub">
          {!settings.gstOn 
            ? "Non-GST Bill" 
            : settings.tt === "intra" 
              ? "GST Registered · Intra-State" 
              : "GST Registered · Inter-State"
          }
        </div>
        <table className="meta-tbl">
          <tbody>
            <tr>
              <td className="ml">Invoice No.</td>
              <td className="mv">
                <input 
                  value={meta.invoiceNo} 
                  onChange={(e) => onMetaChange('invoiceNo', e.target.value)} 
                  style={{ width: '115px' }} 
                />
              </td>
            </tr>
            <tr>
              <td className="ml">Date</td>
              <td className="mv">
                <div className="flex items-center gap-1.5 cursor-pointer relative group" style={{ width: '130px' }}>
                  <input 
                    type="date"
                    value={meta.invoiceDate} 
                    onChange={(e) => onMetaChange('invoiceDate', e.target.value)} 
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    style={{ background: 'transparent', border: 'none', outline: 'none', cursor: 'pointer', width: '100%', fontSize: '13px' }} 
                  />
                  <Calendar size={14} className="text-navy/60 group-hover:text-navy transition-colors shrink-0 no-print" />
                </div>
              </td>
            </tr>
            {settings.gstOn && (
            <tr className="gc">
              <td className="ml">Due Date</td>
              <td className="mv">
                <div className="flex items-center gap-1.5 cursor-pointer relative group" style={{ width: '130px' }}>
                  <input 
                    type="date"
                    value={meta.dueDate} 
                    onChange={(e) => onMetaChange('dueDate', e.target.value)} 
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    style={{ background: 'transparent', border: 'none', outline: 'none', cursor: 'pointer', width: '100%', fontSize: '13px' }} 
                  />
                  <Calendar size={14} className="text-navy/60 group-hover:text-navy transition-colors shrink-0 no-print" />
                </div>
              </td>
            </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
