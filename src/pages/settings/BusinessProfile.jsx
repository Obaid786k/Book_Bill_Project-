import React, { useState, useEffect, useCallback, useRef } from 'react';
import { settingsService } from '../../services/settingsService';
import { Card } from '../../components/common/Card';

export const BusinessProfile = () => {
  const [profile, setProfile] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const saveTimerRef = useRef(null);

  // Load profile on mount
  useEffect(() => {
    settingsService.getBusinessProfile().then(setProfile);
  }, []);

  // Debounced Auto-save — cancels any previous pending save so rapid edits
  // can't queue overlapping requests whose responses might arrive out of
  // order and overwrite a newer value with an older one.
  const debouncedSave = useCallback(
    (data) => {
      setSaveStatus('Saving...');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        await settingsService.saveBusinessProfile(data);
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

  if (!profile) return <div className="p-8">Loading profile...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Business Profile</h1>
          <p className="text-sm text-ink2 mt-1">Manage your shop details and billing preferences.</p>
        </div>
        {saveStatus && (
          <span className="text-xs font-bold text-ink3 bg-row-alt px-3 py-1 rounded-full animate-fade-in">
            {saveStatus}
          </span>
        )}
      </div>

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
              <input 
                name="shopState"
                value={profile.shopState}
                onChange={handleChange}
                className="w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white"
              />
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
