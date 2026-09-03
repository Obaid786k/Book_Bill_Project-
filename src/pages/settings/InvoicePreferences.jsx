import React, { useState, useEffect, useCallback, useRef } from 'react';
import { settingsService } from '../../services/settingsService';
import { Card } from '../../components/common/Card';

export const InvoicePreferences = () => {
  const [profile, setProfile] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const saveTimerRef = useRef(null);

  useEffect(() => {
    settingsService.getInvoicePreferences().then(setProfile);
  }, []);

  const debouncedSave = useCallback(
    (data) => {
      setSaveStatus('Saving...');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        await settingsService.saveInvoicePreferences(data);
        setSaveStatus('Saved');
        setTimeout(() => setSaveStatus(''), 2000);
      }, 1500);
    },
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => {
      const next = { ...prev, [name]: value };
      debouncedSave(next);
      return next;
    });
  };

  if (!profile) return <div className="p-8">Loading...</div>;

  const handleListKeyDown = (e) => {
    if (e.key === 'Enter') {
      const el = e.target;
      const { name, value, selectionStart, selectionEnd } = el;
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
          handleChange({ target: { name, value: newText } });
          setTimeout(() => {
            el.selectionStart = el.selectionEnd = newTextBefore.length;
          }, 0);
          return;
        }

        const insertText = `\n${number + 1}. `;
        const newTextBefore = textBefore + insertText;
        const newText = newTextBefore + value.substring(selectionStart);
        handleChange({ target: { name, value: newText } });
        setTimeout(() => {
          el.selectionStart = el.selectionEnd = newTextBefore.length;
        }, 0);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Invoice Preferences</h1>
          <p className="text-sm text-ink2 mt-1">Configure how your invoices look and behave.</p>
        </div>
        {saveStatus && (
          <span className="text-xs font-bold text-ink3 bg-row-alt px-3 py-1 rounded-full animate-fade-in">
            {saveStatus}
          </span>
        )}
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-6 pb-2 border-b border-bb2">
            Numbering & Tax Defaults
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[13px] font-bold text-navy mb-1.5">Next Invoice Number</label>
              <input 
                name="invoiceSequence"
                value={profile.invoiceSequence || ''}
                onChange={handleChange}
                placeholder="e.g., INV-0001"
                className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white"
              />
              <p className="text-xs text-ink2 mt-1.5">All new invoices will auto-increment from this number.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-bold text-navy mb-1.5">Default Tax Type</label>
              <select 
                name="defaultTaxType"
                value={profile.defaultTaxType}
                onChange={handleChange}
                className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white"
              >
                <option value="inclusive">Tax Inclusive</option>
                <option value="exclusive">Tax Exclusive</option>
                <option value="none">No Tax (Composition Scheme)</option>
              </select>
              <p className="text-xs text-ink2 mt-1.5">This will be auto-selected for new invoices.</p>
            </div>
            
            <div>
              <label className="block text-[13px] font-bold text-navy mb-1.5">Default Copy Type</label>
              <select 
                name="defaultCopyType"
                value={profile.defaultCopyType}
                onChange={handleChange}
                className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white"
              >
                <option value="original">Original for Recipient</option>
                <option value="duplicate">Duplicate for Transporter</option>
                <option value="triplicate">Triplicate for Supplier</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-6 pb-2 border-b border-bb2">
            Terms & Conditions
          </h2>
          <div>
            <label className="block text-[13px] font-bold text-navy mb-1.5">Default Terms & Conditions Text</label>
            <textarea 
              name="defaultTerms"
              value={profile.defaultTerms}
              onChange={handleChange}
              onKeyDown={handleListKeyDown}
              rows="4"
              className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white resize-none"
            />
            <p className="text-xs text-ink2 mt-1.5">This text will automatically appear at the bottom of all generated invoices.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InvoicePreferences;
