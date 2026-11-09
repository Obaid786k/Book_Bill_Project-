import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { settingsService } from '../../services/settingsService';
import { Card } from '../../components/common/Card';
import { Skeleton } from '../../components/feedback/Skeleton';
import { useToast } from '../../components/feedback/Toast';
import { STATES } from '../../utils/constants';

export const BusinessProfile = () => {
  const [profile, setProfile] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const saveTimerRef = useRef(null);
  const { toast } = useToast();

  // Load profile on mount
  useEffect(() => {
    settingsService.getBusinessProfile().then(setProfile)
      .catch(() => toast.error('Could not load settings. Please refresh the page.'));
  }, [toast]);

  // Debounced Auto-save — cancels any previous pending save so rapid edits
  // can't queue overlapping requests whose responses might arrive out of
  // order and overwrite a newer value with an older one.
  const debouncedSave = useCallback(
    (data) => {
      setSaveStatus('Saving...');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          await settingsService.saveBusinessProfile(data);
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
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader />
      <Card className="p-6 space-y-6">
        <Skeleton className="h-4 w-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-16 md:col-span-2" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </div>
      </Card>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader actions={saveStatus && (<span className="text-xs font-bold text-ink3 bg-row-alt px-3 py-1 rounded-full animate-fade-in">
            {saveStatus}
          </span>)} />

      <div className="space-y-6">
        {/* Basic Info */}
        <Card className="p-6">
          <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-6 pb-2 border-b border-bb2">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-bold text-navy mb-1.5">Business / Shop Name</label>
              <input 
                name="shopName"
                value={profile.shopName}
                onChange={handleChange}
                className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-navy mb-1.5">Tagline (Optional)</label>
              <input 
                name="tagline"
                value={profile.tagline}
                onChange={handleChange}
                className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[13px] font-bold text-navy mb-1.5">Full Address</label>
              <textarea 
                name="shopAddress"
                value={profile.shopAddress}
                onChange={handleChange}
                rows="2"
                className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white resize-none"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-navy mb-1.5">State</label>
              <select
                name="shopState"
                value={profile.shopState || ''}
                onChange={handleChange}
                className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white"
              >
                <option value="">Select State</option>
                {/* Keep a previously typed (non-standard) value visible until changed */}
                {profile.shopState && !STATES.some(s => s.n === profile.shopState) && (
                  <option value={profile.shopState}>{profile.shopState}</option>
                )}
                {STATES.map(s => <option key={s.c} value={s.n}>{s.n}</option>)}
              </select>
              <p className="text-xs text-ink2 mt-1.5">Used to decide CGST + SGST vs IGST on invoices.</p>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-navy mb-1.5">Contact Phone</label>
              <input 
                name="shopPhone"
                value={profile.shopPhone}
                onChange={handleChange}
                className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-navy mb-1.5">Contact Email</label>
              <input 
                name="shopEmail"
                value={profile.shopEmail}
                onChange={handleChange}
                className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white"
              />
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default BusinessProfile;
