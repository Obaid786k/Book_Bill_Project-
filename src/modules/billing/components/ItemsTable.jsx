import React, { useState, useEffect } from 'react';
import { EmptyState } from '../../../components/common/EmptyState';
import { Button } from '../../../components/common/Button';
import { ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { productService } from '../../../services/productService';

export const ItemsTable = ({ items, settings, onItemChange, onAddItem, onRemoveItem }) => {
  const { gstOn, tt } = settings;
  const [catalog, setCatalog] = useState([]);
  const bottomRef = React.useRef(null);
  const prevItemsLength = React.useRef(items.length);

  useEffect(() => {
    productService.getProducts().then(setCatalog);
  }, []);

  useEffect(() => {
    if (items.length > prevItemsLength.current) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
    prevItemsLength.current = items.length;
  }, [items.length]);

  const handleNameChange = (id, val) => {
    onItemChange(id, 'name', val);
    const match = catalog.find(p => p.name === val);
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
      <table className="itbl">
        <thead>
          <tr>
            <th className="sno">#</th>
            <th style={{ textAlign: 'left', minWidth: '110px' }}>Item / Description</th>
            {gstOn && <th className="gc" style={{ minWidth: '65px' }}>HSN / SAC</th>}
            <th style={{ minWidth: '42px' }}>Qty</th>
            <th style={{ minWidth: '46px' }}>Unit</th>
            <th style={{ minWidth: '68px' }}>Rate (₹)</th>
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
            <tr key={item.id || idx}>
              <td className="sno">{idx + 1}</td>
              <td className="nc">
                <input 
                  list="product-catalog"
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
                  min="0" 
                  step="any" 
                  value={item.qty} 
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
                  {['Pcs', 'Kg', 'Gram', 'Ltr', 'Box', 'Dozen', 'Meter', 'Pack', 'Nos', 'Set', 'Pair'].map(u => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </td>
              <td>
                <input 
                  className="fr" 
                  type="number" 
                  min="0" 
                  step="any" 
                  value={item.rate} 
                  onChange={(e) => onItemChange(item.id, 'rate', e.target.value)} 
                />
              </td>
              <td>
                <input 
                  className="fd" 
                  type="number" 
                  min="0" 
                  max="100" 
                  step="any" 
                  value={item.disc} 
                  onChange={(e) => onItemChange(item.id, 'disc', e.target.value)} 
                />
              </td>
              <td className="comp fa">{item.fa}</td>
              
              {gstOn && tt === 'intra' && (
                <>
                  <td className="gc intra">
                    <select 
                      className="fg" 
                      value={item.gp} 
                      onChange={(e) => onItemChange(item.id, 'gp', e.target.value)}
                      style={{ width: '100%', borderBottom: 'none', fontSize: '10.5px' }}
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                  </td>
                  <td className="comp gc intra fca">{item.fca}</td>
                  <td className="comp gc intra fsp">{item.fsp}</td>
                  <td className="comp gc intra fsa">{item.fsa}</td>
                </>
              )}
              
              {gstOn && tt === 'inter' && (
                <>
                  <td className="gc inter">
                    <select 
                      className="fg" 
                      value={item.gp} 
                      onChange={(e) => onItemChange(item.id, 'gp', e.target.value)}
                      style={{ width: '100%', borderBottom: 'none', fontSize: '10.5px' }}
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
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

      <datalist id="product-catalog">
        {catalog.map(p => (
          <option key={p.id} value={p.name} />
        ))}
      </datalist>

      <div className="add-row-wrap no-print mt-4 mb-2 flex justify-start" ref={bottomRef}>
        <Button variant="primary" onClick={onAddItem} className="gap-2 px-4 shadow-sm font-bold tracking-wide">
          <Plus size={16} /> Add New Item
        </Button>
      </div>
    </>
  );
};
