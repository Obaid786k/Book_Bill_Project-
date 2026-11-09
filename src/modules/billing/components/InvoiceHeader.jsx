import React from 'react';
import { STATES } from '../../../utils/constants';
import { MapPin, Phone, Mail, Receipt, Map } from 'lucide-react';
import { DateField } from '../../../components/common/DateField';
import { AutoTextarea } from '../../../components/common/AutoTextarea';
import { cleanGstin, isValidGstin } from '../../../utils/gstin';
import { Link } from 'react-router-dom';

// showDueDate: only unpaid (Pending) bills have a due date.
export const InvoiceHeader = ({ shop, meta, settings, isSaved, showDueDate, onShopChange, onMetaChange }) => {
  const shopGstinBad = shop.shopGstin && !isValidGstin(shop.shopGstin);
  // Composition dealers issue a "Bill of Supply" and must still show their GSTIN.
  const isComposition = !settings.gstOn && settings.composition;
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
            <MapPin size={12} className="ci" aria-hidden="true" />
            <AutoTextarea 
              value={shop.shopAddress} 
              onChange={(e) => onShopChange('shopAddress', e.target.value)} 
              placeholder="Address"
            />
          </div>
          <div className="co-row">
            <Phone size={12} className="ci" aria-hidden="true" />
            <input 
              value={shop.shopPhone} 
              onChange={(e) => onShopChange('shopPhone', e.target.value)} 
              placeholder="Phone" 
            />
          </div>
          <div className="co-row">
            <Mail size={12} className="ci" aria-hidden="true" />
            <input 
              value={shop.shopEmail} 
              onChange={(e) => onShopChange('shopEmail', e.target.value)} 
              placeholder="Email" 
            />
          </div>
          {(settings.gstOn || isComposition) && (
            <div className={settings.gstOn ? "co-row gc" : "co-row"}>
              <Receipt size={12} className="ci" aria-hidden="true" />
              <input 
                value={shop.shopGstin} 
                onChange={(e) => onShopChange('shopGstin', cleanGstin(e.target.value))} 
                placeholder="GSTIN (15 digits)" 
                maxLength={15}
                aria-invalid={!!shopGstinBad}
                style={shopGstinBad ? { color: 'var(--red)' } : undefined}
              />
              {shopGstinBad && <span className="no-print" style={{ fontSize: '10px', color: 'var(--red)', whiteSpace: 'nowrap' }}>Check GSTIN</span>}
            </div>
          )}
          <div className="co-row">
            <Map size={12} className="ci" aria-hidden="true" />
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
        <div className="doc-lbl">{settings.gstOn ? "TAX INVOICE" : isComposition ? "BILL OF SUPPLY" : "CASH MEMO"}</div>
        <div className="doc-sub">
          {isComposition
            ? "Composition taxable person, not eligible to collect tax on supplies"
            : !settings.gstOn
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
                {/* Set by the server when the bill is saved — not editable here. */}
                <input
                  value={meta.invoiceNo}
                  placeholder="Auto"
                  readOnly
                  title="Set automatically. Change numbering in Settings → Invoice Preferences."
                  style={{ width: '115px', cursor: 'default' }}
                />
                {!isSaved && (
                  <div className="no-print" style={{ fontSize: '10px', color: 'var(--ink3)' }}>
                    Next (auto) · <Link to="/settings/invoice" style={{ textDecoration: 'underline' }}>change</Link>
                  </div>
                )}
              </td>
            </tr>
            <tr>
              <td className="ml">Date</td>
              <td className="mv">
                {/* Past or future allowed for now (common practice); can be limited later per GST rules. */}
                <DateField label="invoice date" value={meta.invoiceDate} onChange={(v) => onMetaChange('invoiceDate', v)} />
              </td>
            </tr>
            {showDueDate && (
            <tr>
              <td className="ml">Due Date</td>
              <td className="mv">
                <DateField label="due date" value={meta.dueDate} min={meta.invoiceDate} onChange={(v) => onMetaChange('dueDate', v)} />
              </td>
            </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
