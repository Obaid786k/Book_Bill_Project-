import React, { useState, useEffect } from 'react';
import { EmptyState } from '../../../components/common/EmptyState';
import { ShoppingCart, Trash2, Plus } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { productService } from '../../../services/productService';
import { GST_RATES, UNITS, withCurrent } from '../../../utils/constants';

const GstSelect = ({ item, onItemChange }) => (
  <select
    className="fg"
    value={String(item.gp)}
    onChange={(e) => onItemChange(item.id, 'gp', e.target.value)}
    style={{ width: '100%', borderBottom: 'none', fontSize: '10.5px' }}
  >
    {withCurrent(GST_RATES, item.gp).map(r => <option key={r} value={r}>{r}%</option>)}
  </select>
);

// Mouse-wheel over a focused number box must not change the value.
const stopWheel = (e) => e.currentTarget.blur();

// Click / double-click / Tab into a number box selects its value, so typing REPLACES the
// default (1 or 0) instead of adding to it ("0" + "5" = "05").
const selectAll = (e) => {
  const el = e.currentTarget;
  requestAnimationFrame(() => { try { el.select(); } catch { /* ignore */ } });
};
// A zero rate / discount is shown as a grey "0" hint, so the box is empty when you start typing.
const hideZero = (v) => (v === 0 || v === '0' ? '' : v);

// focusTick: increases each time the user adds a row -> cursor goes to that row's item name.
export const ItemsTable = ({ items, settings, onItemChange, onAddItem, onRemoveItem, focusTick = 0, hsnSuggestions = [] }) => {
  const { gstOn, tt } = settings;
  const inclusive = gstOn && settings.priceMode === 'inclusive';
  const [catalog, setCatalog] = useState([]);
  const tableRef = React.useRef(null);
  const focusRowName = (idx) => {
    tableRef.current?.querySelector(`[data-row-name="${idx}"]`)?.focus();
  };

  // Enter in a row: go to the next row's item name; on the last row add a new row.
  const onRowKeyDown = (e, idx) => {
    if (e.key !== 'Enter' || e.nativeEvent.isComposing || e.ctrlKey || e.metaKey) return;
    if (e.target.tagName === 'BUTTON') return; // Enter on the delete button deletes
    // Item name: let Enter pick a product suggestion first, then move on to Qty.
    if (e.target.hasAttribute('data-row-name')) {
      setTimeout(() => tableRef.current?.querySelector(`[data-row-qty="${idx}"]`)?.focus(), 0);
      return;
    }
    e.preventDefault();
    if (idx === items.length - 1) onAddItem();
    else focusRowName(idx + 1);
  };

  useEffect(() => {
    // Catalog is only for autocomplete — billing still works without it.
    productService.getProducts().then(setCatalog).catch(() => setCatalog([]));
  }, []);

  // New row from the user: cursor into its name and bring it to the middle of the screen.
  useEffect(() => {
    if (!focusTick) return;
    const t = setTimeout(() => {
      const el = tableRef.current?.querySelector(`[data-row-name="${items.length - 1}"]`);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 30);
    return () => clearTimeout(t);
  }, [focusTick]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNameChange = (id, val) => {
    onItemChange(id, 'name', val);
    const key = String(val).trim().toLowerCase();
    const match = key && catalog.find(p => String(p.name).trim().toLowerCase() === key);
    if (match) {
      onItemChange(id, 'rate', match.rate || 0);
      onItemChange(id, 'unit', match.unit || 'Pcs');
      if (gstOn) {
        onItemChange(id, 'hsn', match.hsn || '');
        onItemChange(id, 'gp', match.gp || '18');
      }
    }
  };

  return (
    <>
      <div className="itbl-wrap">
      <table className="itbl" ref={tableRef}>
        <thead>
          <tr>
            <th className="sno">#</th>
            <th style={{ textAlign: 'left', minWidth: '110px' }}>Item / Description</th>
            {gstOn && <th className="gc" style={{ minWidth: '65px' }}>HSN / SAC</th>}
            <th style={{ minWidth: '42px' }}>Qty</th>
            <th style={{ minWidth: '66px' }}>Unit</th>
            <th style={{ minWidth: '68px' }}>{inclusive ? 'Rate incl. GST (₹)' : 'Rate (₹)'}</th>
            <th style={{ minWidth: '48px' }}>Disc %</th>
            <th style={{ minWidth: '75px' }}>{gstOn ? "Taxable Amt" : "Amount (₹)"}</th>
            
            {gstOn && tt === 'intra' && (
              <>
                <th className="gc intra" style={{ minWidth: '42px' }}>CGST%</th>
                <th className="gc intra" style={{ minWidth: '52px' }}>CGST Amt</th>
                <th className="gc intra" style={{ minWidth: '42px' }}>SGST%</th>
                <th className="gc intra" style={{ minWidth: '52px' }}>SGST Amt</th>
              </>
            )}
            
            {gstOn && tt === 'inter' && (
              <>
                <th className="gc inter" style={{ minWidth: '42px' }}>IGST%</th>
                <th className="gc inter" style={{ minWidth: '52px' }}>IGST Amt</th>
              </>
            )}
            
            <th style={{ minWidth: '68px' }}>Total (₹)</th>
            <th className="rxc no-print" style={{ width: '26px' }}></th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={gstOn ? (tt === 'intra' ? 12 : 10) : 8} className="p-0">
                <div className="py-6">
                  <EmptyState 
                    icon={ShoppingCart}
                    title="No items added"
                    description="Click 'Add Item' below to start building your invoice."
                  />
                </div>
              </td>
            </tr>
          )}
          {items.map((item, idx) => (
            <tr key={item.id || idx} onKeyDown={(e) => onRowKeyDown(e, idx)}>
              <td className="sno">{idx + 1}</td>
              <td className="nc">
                <input 
                  list="product-catalog"
                  data-row-name={idx}
                  aria-label={`Item ${idx + 1} name`}
                  className="fn" 
                  value={item.name} 
                  onChange={(e) => handleNameChange(item.id, e.target.value)} 
                  placeholder="Item name / description" 
                  autoComplete="off"
                />
              </td>
              {gstOn && (
                <td className="gc">
                  <input 
                    list="recall-hsn" autoComplete="off"
                    className="fh" 
                    value={item.hsn} 
                    onChange={(e) => onItemChange(item.id, 'hsn', e.target.value)} 
                    placeholder="HSN/SAC" 
                    maxLength="8" 
                    style={{ width: '100%', textAlign: 'center', borderBottom: 'none', fontSize: '10.5px' }} 
                  />
                </td>
              )}
              <td>
                <input 
                  className="fq" 
                  type="number"
                  data-row-qty={idx} 
                  onWheel={stopWheel}
                  min="0" 
                  step="any" 
                  value={item.qty}
                  onFocus={selectAll} 
                  onChange={(e) => onItemChange(item.id, 'qty', e.target.value)} 
                />
              </td>
              <td>
                <select 
                  className="fu" 
                  value={item.unit} 
                  onChange={(e) => onItemChange(item.id, 'unit', e.target.value)}
                  style={{ width: '100%', borderBottom: 'none', fontSize: '10.5px' }}
                >
                  {withCurrent(UNITS, item.unit).map(u => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </td>
              <td>
                <input 
                  className="fr" 
                  type="number" 
                  onWheel={stopWheel}
                  min="0" 
                  step="any" 
                  value={hideZero(item.rate)}
                  placeholder="0"
                  onFocus={selectAll} 
                  onChange={(e) => onItemChange(item.id, 'rate', e.target.value)} 
                />
              </td>
              <td>
                <input 
                  className="fd" 
                  type="number" 
                  onWheel={stopWheel}
                  min="0" 
                  max="100" 
                  step="any" 
                  value={hideZero(item.disc)}
                  placeholder="0"
                  onFocus={selectAll} 
                  onChange={(e) => onItemChange(item.id, 'disc', e.target.value)} 
                />
              </td>
              <td className="comp fa">{item.fa}</td>
              
              {gstOn && tt === 'intra' && (
                <>
                  <td className="gc intra">
                    <GstSelect item={item} onItemChange={onItemChange} />
                  </td>
                  <td className="comp gc intra fca">{item.fca}</td>
                  <td className="comp gc intra fsp">{item.fsp}</td>
                  <td className="comp gc intra fsa">{item.fsa}</td>
                </>
              )}
              
              {gstOn && tt === 'inter' && (
                <>
                  <td className="gc inter">
                    <GstSelect item={item} onItemChange={onItemChange} />
                  </td>
                  <td className="comp gc inter fia">{item.fia}</td>
                </>
              )}
              
              <td className="comp ft">{item.ft}</td>
              <td className="rxc no-print">
                <button 
                  className="w-7 h-7 flex items-center justify-center rounded-md text-red hover:bg-red-bg transition-colors mx-auto" 
                  onClick={() => onRemoveItem(item.id)} 
                  title="Remove Item"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <datalist id="product-catalog">
        {catalog.map(p => (
          <option key={p.id} value={p.name} label={`₹${p.rate}${gstOn ? ` · GST ${p.gp}%` : ''}${p.unit ? ` · ${p.unit}` : ''}`} />
        ))}
      </datalist>
      <datalist id="recall-hsn">{hsnSuggestions.map(v => <option key={v} value={v} />)}</datalist>

      <div className="add-row-wrap no-print mt-4 mb-2 flex justify-start">
        <Button variant="outline" onClick={onAddItem} className="gap-2 px-4 font-semibold">
          <Plus size={16} /> Add item
        </Button>
      </div>

    </>
  );
};
