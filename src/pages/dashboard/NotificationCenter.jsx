import React from 'react';
import { Loader2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { AlertList } from '../../components/shell/AlertList';
import { useAlerts, useAlertReadStore } from '../../hooks/useAlerts';

// Full list of the same alerts the bell shows.
export const NotificationCenter = () => {
  const { alerts, unreadCount, isLoading } = useAlerts();
  const markRead = useAlertReadStore((s) => s.markRead);

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        actions={unreadCount > 0 && (
          <Button variant="outline" onClick={() => markRead(alerts.map((a) => a.id))}>Mark all as read</Button>
        )}
      />
      <div className="bg-paper border border-bb2 rounded-[12px] overflow-hidden">
        {isLoading
          ? <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-navy" /></div>
          : <AlertList alerts={alerts} />}
      </div>
    </div>
  );
};

export default NotificationCenter;
