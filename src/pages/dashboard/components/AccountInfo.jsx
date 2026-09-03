import React from 'react';
import { HardDrive, Bell } from 'lucide-react';

export const AccountInfo = ({ data }) => {
  if (!data) return null;

  return (
    <div className="mt-8 pt-6 border-t border-bb flex flex-wrap items-center justify-between text-[12px] text-ink2 gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <HardDrive size={14} className="text-ink3" />
          <span>Storage: <strong className="text-navy">{data.storageUsed}</strong> / {data.storageLimit}</span>
        </div>
        <div className="hidden sm:block w-32 h-1.5 bg-bb2 rounded-full overflow-hidden">
          <div className="bg-navy h-full rounded-full" style={{ width: '9%' }}></div>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5">
        <Bell size={14} className="text-ink3" />
        <span>You have <strong className="text-navy">{data.unreadNotifications} unread</strong> notifications</span>
      </div>
    </div>
  );
};
