import React, { useState, useEffect, useCallback, useRef } from 'react';
import { settingsService } from '../../services/settingsService';
import { Card } from '../../components/common/Card';
import { Skeleton } from '../../components/feedback/Skeleton';

export const PaymentSettings = () => {
  const [profile, setProfile] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const saveTimerRef = useRef(null);

  useEffect(() => {
    settingsService.getPaymentSettings().then(setProfile);
  }, []);

  const debouncedSave = useCallback(
    (data) => {
      setSaveStatus('Saving...');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          await settingsService.savePaymentSettings(data);
          setSaveStatus('Saved');
          setTimeout(() => setSaveStatus(''), 2000);
        } catch {
          setSaveStatus('Save failed — try again');
          setTimeout(() => setSaveStatus(''), 3000);
        }
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

  if (!profile) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      <Card className="p-6"><Skeleton className="h-4 w-40 mb-6" /><Skeleton className="h-9 w-48" /></Card>
      <Card className="p-6">
        <Skeleton className="h-4 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-9 md:col-span-2" />
          <Skeleton className="h-9" /><Skeleton className="h-9" />
        </div>
      </Card>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Payment Settings</h1>
          <p className="text-sm text-ink2 mt-1">Configure your bank accounts and payment collection preferences.</p>
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
            Collection Defaults
          </h2>
          <div>
            <label className="block text-[13px] font-bold text-navy mb-1.5">Default Payment Mode</label>
            <select 
              name="payMode"
              value={profile.payMode}
              onChange={handleChange}
              className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Card</option>
            </select>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-6 pb-2 border-b border-bb2">
            Bank Details (For Invoice PDF)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[13px] font-bold text-navy mb-1.5">UPI ID (For QR Code)</label>
              <input 
                name="upiId"
                value={profile.upiId}
                onChange={handleChange}
                placeholder="merchant@upi"
                className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white"
              />
              <p className="text-xs text-ink2 mt-1.5">Used to generate a scannable payment QR code on invoices.</p>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-navy mb-1.5">Bank Account No.</label>
              <input 
                name="bankAcc"
                value={profile.bankAcc}
                onChange={handleChange}
                placeholder="0000 0000 0000"
                className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-navy mb-1.5">Bank IFSC Code</label>
              <input 
                name="ifsc"
                value={profile.ifsc}
                onChange={handleChange}
                placeholder="SBIN0000000"
                className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSettings;
