import React from 'react';
import { ComingSoonPanel } from '../../components/common/ComingSoonPanel';
import { Bell } from 'lucide-react';

export const NotificationCenter = () => {
  return (
    <div className="h-[calc(100vh-150px)] flex items-center justify-center">
      <ComingSoonPanel 
        icon={Bell}
        title="Notification Center is coming soon"
        description="We're building a centralized hub for all your alerts, reminders, and system events. Stay tuned!"
      />
    </div>
  );
};

export default NotificationCenter;
