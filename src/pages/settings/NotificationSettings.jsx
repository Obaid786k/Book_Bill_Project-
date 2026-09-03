import React, { useState, useEffect, useCallback, useRef } from 'react';
import { settingsService } from '../../services/settingsService';
import { Card } from '../../components/common/Card';
import { clsx } from 'clsx';

export const NotificationSettings = () => {
  const [profile, setProfile] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const saveTimerRef = useRef(null);

  useEffect(() => {
    settingsService.getNotificationSettings().then(setProfile);
  }, []);

  const debouncedSave = useCallback(
    (data) => {
      setSaveStatus('Saving...');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        await settingsService.saveNotificationSettings(data);
        setSaveStatus('Saved');
        setTimeout(() => setSaveStatus(''), 2000);
      }, 1500);
    },
    []
  );

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setProfile(prev => {
      const next = { ...prev, [name]: checked };
      debouncedSave(next);
      return next;
    });
  };

  if (!profile) return <div className="p-8">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Notifications</h1>
          <p className="text-sm text-ink2 mt-1">Manage when and how you receive alerts.</p>
        </div>
        {saveStatus && (
          <span className="text-xs font-bold text-ink3 bg-row-alt px-3 py-1 rounded-full animate-fade-in">
            {saveStatus}
          </span>
        )}
      </div>

      <div className="space-y-4">
        <Card className="p-4 flex items-center justify-between hover:border-navy-lt/30 transition-colors">
          <div>
            <h3 className="text-[14px] font-bold text-navy">Email Alerts</h3>
            <p className="text-[12.5px] text-ink2 mt-1">Receive important alerts and payment links via email.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="emailAlerts" checked={profile.emailAlerts} onChange={handleChange} className="sr-only peer" />
            <div className={clsx("w-11 h-6 bg-bb2 rounded-full peer peer-checked:bg-green transition-colors", 
              "after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white")}>
            </div>
          </label>
        </Card>

        <Card className="p-4 flex items-center justify-between hover:border-navy-lt/30 transition-colors">
          <div>
            <h3 className="text-[14px] font-bold text-navy">SMS Alerts</h3>
            <p className="text-[12.5px] text-ink2 mt-1">Get instant SMS notifications for bill generation.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="smsAlerts" checked={profile.smsAlerts} onChange={handleChange} className="sr-only peer" />
            <div className={clsx("w-11 h-6 bg-bb2 rounded-full peer peer-checked:bg-green transition-colors", 
              "after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white")}>
            </div>
          </label>
        </Card>

        <Card className="p-4 flex items-center justify-between hover:border-navy-lt/30 transition-colors">
          <div>
            <h3 className="text-[14px] font-bold text-navy">Daily Business Summary</h3>
            <p className="text-[12.5px] text-ink2 mt-1">Receive a daily recap of sales and revenue.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="dailySummary" checked={profile.dailySummary} onChange={handleChange} className="sr-only peer" />
            <div className={clsx("w-11 h-6 bg-bb2 rounded-full peer peer-checked:bg-green transition-colors", 
              "after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white")}>
            </div>
          </label>
        </Card>

        <Card className="p-4 flex items-center justify-between hover:border-navy-lt/30 transition-colors">
          <div>
            <h3 className="text-[14px] font-bold text-navy">Low Stock Alerts</h3>
            <p className="text-[12.5px] text-ink2 mt-1">Get notified when products drop below threshold.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="stockAlerts" checked={profile.stockAlerts} onChange={handleChange} className="sr-only peer" />
            <div className={clsx("w-11 h-6 bg-bb2 rounded-full peer peer-checked:bg-green transition-colors", 
              "after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white")}>
            </div>
          </label>
        </Card>
      </div>
    </div>
  );
};

export default NotificationSettings;
