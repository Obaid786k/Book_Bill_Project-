import React, { useState, useEffect } from 'react';
import { Drawer } from '../../components/common/Drawer';
import { Button } from '../../components/common/Button';
import { productService } from '../../services/productService';

const INITIAL_FORM = {
  name: '',
  category: '',
  rate: '',
  unit: 'Pcs',
  hsn: '',
  gp: '18'
};

export const ProductForm = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setFormData(product || INITIAL_FORM);
      productService.getCategories().then(setCategories);
    }
  }, [isOpen, product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.rate) return;
    
    // Parse numbers
    const finalData = {
      ...formData,
      rate: parseFloat(formData.rate) || 0
    };
    
    await productService.saveProduct(finalData);
    onSave();
    onClose();
  };

  return (
    <Drawer 
      isOpen={isOpen} 
      onClose={onClose} 
      title={product ? "Edit Product" : "Add New Product"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-paper">
          <div>
            <label className="block text-[13px] font-bold text-navy mb-1.5">Product Name <span className="text-rose">*</span></label>
            <input 
              type="text" 
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors"
              placeholder="e.g. Paracetamol 500mg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-navy mb-1.5">Selling Price (₹) <span className="text-rose">*</span></label>
              <input 
                type="number" 
                name="rate"
                min="0"
                step="any"
                required
                value={formData.rate}
                onChange={handleChange}
                className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-navy mb-1.5">Unit</label>
              <select 
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white"
              >
                {['Pcs', 'Kg', 'Gram', 'Ltr', 'Box', 'Dozen', 'Meter', 'Pack', 'Nos', 'Set', 'Pair', 'Session', 'Project', 'Hour', 'Month', 'Service', 'Strip', 'Bag', 'Bottle'].map(u => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-navy mb-1.5">Category</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white"
              >
                <option value="">Uncategorized</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-navy mb-1.5">GST Rate (%)</label>
              <select 
                name="gp"
                value={formData.gp}
                onChange={handleChange}
                className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white"
              >
                <option value="0">0% (Exempt)</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-navy mb-1.5">HSN / SAC Code</label>
            <input 
              type="text" 
              name="hsn"
              maxLength="8"
              value={formData.hsn}
              onChange={handleChange}
              className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors"
              placeholder="e.g. 3004"
            />
          </div>
        </div>

        <div className="p-4 border-t border-bb bg-row-alt flex justify-end gap-3 flex-shrink-0">
          <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit">Save Product</Button>
        </div>
      </form>
    </Drawer>
  );
};
