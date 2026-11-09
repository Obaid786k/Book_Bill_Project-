import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { accountService, formatBytes } from '../../services/accountService';
import { Card } from '../../components/common/Card';

export const StorageUsage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    accountService.getStorageDetails().then(setData);
  }, []);

  if (!data) return <div className="max-w-5xl mx-auto"><PageHeader /><p className="text-[13px] text-ink2">Loading storage info...</p></div>;

  const share = (bytes) => (data.usedBytes ? (bytes / data.usedBytes) * 100 : 0);

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader />

      <Card className="p-6">
        <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-6 pb-2 border-b border-bb2">
          Your data
        </h2>

        <div className="mb-8">
          <div className="flex items-end justify-between mb-2">
            <div>
              <span className="text-2xl font-display font-bold text-navy">{formatBytes(data.usedBytes)}</span>
              <span className="text-sm text-ink2 ml-2">stored (approx.)</span>
            </div>
          </div>
          <div className="h-4 bg-row-alt rounded-full overflow-hidden flex">
            {data.breakdown.map((item) => (
              <div
                key={item.name}
                style={{ width: `${share(item.bytes)}%`, backgroundColor: item.color }}
                className="h-full transition-all duration-700"
                title={`${item.name}: ${formatBytes(item.bytes)}`}
              />
            ))}
          </div>
        </div>

        <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-4 pb-2 border-b border-bb2">
          Breakdown
        </h2>
        <div className="space-y-4">
          {data.breakdown.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm font-medium text-ink">{item.name}</span>
              </div>
              <span className="text-sm font-bold text-navy">{formatBytes(item.bytes)} <span className="text-ink3 font-medium">· {share(item.bytes).toFixed(0)}%</span></span>
            </div>
          ))}
          <p className="pt-4 border-t border-bb2 text-[12.5px] text-ink2">
            Sizes are estimated from your saved records. Your database plan limit is shown in your Supabase project settings.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default StorageUsage;
