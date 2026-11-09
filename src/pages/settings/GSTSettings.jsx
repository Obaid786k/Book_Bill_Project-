import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { settingsService } from '../../services/settingsService';
import { Card } from '../../components/common/Card';
import { Skeleton } from '../../components/feedback/Skeleton';
import { useToast } from '../../components/feedback/Toast';

export const GSTSettings = () => {
  const [profile, setProfile] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const saveTimerRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    settingsService.getGSTSettings().then(setProfile)
      .catch(() => toast.error('Could not load settings. Please refresh the page.'));
  }, [toast]);

  const debouncedSave = useCallback(
    (data) => {
      setSaveStatus('Saving...');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          await settingsService.saveGSTSettings(data);
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
      <Card className="p-6"><Skeleton className="h-4 w-40 mb-6" /><Skeleton className="h-9" /></Card>
      <Card className="p-6"><Skeleton className="h-4 w-40 mb-6" /><Skeleton className="h-9" /></Card>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader actions={saveStatus && (<span className="text-xs font-bold text-ink3 bg-row-alt px-3 py-1 rounded-full animate-fade-in">
            {saveStatus}
          </span>)} />

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-6 pb-2 border-b border-bb2">
            GST Registration
          </h2>
          <div>
            <label className="block text-[13px] font-bold text-navy mb-1.5">Business GSTIN (15 Digits)</label>
            <input 
              name="shopGstin"
              value={profile.shopGstin}
              onChange={handleChange}
              maxLength="15"
              placeholder="e.g. 22AAAAA0000A1Z5"
              className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white uppercase"
            />
            <p className="text-xs text-ink2 mt-1.5">Required for generating valid B2B tax invoices.</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-6 pb-2 border-b border-bb2">
            HSN/SAC Code Rules
          </h2>
          <div>
            <label className="block text-[13px] font-bold text-navy mb-1.5">HSN Code Behavior</label>
            <select 
              name="defaultHsnBehavior"
              value={profile.defaultHsnBehavior}
              onChange={handleChange}
              className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white"
            >
              <option value="optional">Optional (Do not enforce)</option>
              <option value="mandatory">Mandatory for all products</option>
              <option value="auto" disabled>Auto-suggest based on category (Coming soon)</option>
            </select>
            <p className="text-xs text-ink2 mt-1.5">Enforce HSN codes during billing as per your turnover threshold.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GSTSettings;
