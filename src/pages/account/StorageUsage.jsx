import React, { useState, useEffect } from 'react';
import { accountService } from '../../services/accountService';
import { Card } from '../../components/common/Card';

export const StorageUsage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    accountService.getStorageDetails().then(setData);
  }, []);

  if (!data) return <div className="p-8">Loading storage info...</div>;

  const usagePercent = (data.usedMb / data.totalCapacityMb) * 100;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-ink">Storage Usage</h1>
        <p className="text-sm text-ink2 mt-1">Manage your account storage and limits.</p>
      </div>

      <Card className="p-6">
        <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-6 pb-2 border-b border-bb2">
          Capacity
        </h2>
        
        <div className="mb-8">
          <div className="flex items-end justify-between mb-2">
            <div>
              <span className="text-2xl font-display font-bold text-navy">
                {(data.usedMb / 1024).toFixed(2)} GB
              </span>
              <span className="text-sm text-ink2 ml-2">used</span>
            </div>
            <span className="text-sm font-medium text-ink2">
              {(data.totalCapacityMb / 1024).toFixed(2)} GB total
            </span>
          </div>
          
          <div className="h-4 bg-row-alt rounded-full overflow-hidden flex">
            {data.breakdown.map((item, idx) => {
              const width = (item.value / data.totalCapacityMb) * 100;
              return (
                <div 
                  key={idx}
                  style={{ width: `${width}%`, backgroundColor: item.color }}
                  className="h-full transition-all duration-1000"
                  title={`${item.name}: ${item.value} MB`}
                />
              );
            })}
          </div>
          
          <div className="mt-2 text-right">
            <span className="text-xs font-bold text-ink2">{usagePercent.toFixed(1)}% full</span>
          </div>
        </div>

        <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-4 pb-2 border-b border-bb2">
          Breakdown
        </h2>
        
        <div className="space-y-4">
          {data.breakdown.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm font-medium text-ink">{item.name}</span>
              </div>
              <span className="text-sm font-bold text-navy">{item.value} MB</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-4 border-t border-bb2">
            <span className="text-sm font-medium text-ink2">Free Space</span>
            <span className="text-sm font-bold text-green">
              {(data.totalCapacityMb - data.usedMb).toFixed(0)} MB
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StorageUsage;
