import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { HardDrive, PieChart } from 'lucide-react';

export const StorageMonitoring = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminService.getStorageMonitoring().then(setData);
  }, []);

  if (!data) return <div className="p-8">Loading storage info...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-ink">Storage Monitoring</h1>
        <p className="text-sm text-ink2 mt-1">Global platform storage utilization across all regions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard 
          compact
          title="Total Storage Used"
          value={`${data.totalUsedTb} TB`}
          icon={HardDrive}
        />
        <StatCard 
          compact
          title="Total Allocated"
          value={`${data.totalAllocatedTb} TB`}
          icon={PieChart}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 bg-paper border-b border-bb2">
          <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider">Bucket Allocation</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-row-alt border-b border-bb2">
              <th className="py-3 px-4 text-xs font-bold text-ink2 uppercase tracking-wider">Bucket Name</th>
              <th className="py-3 px-4 text-xs font-bold text-ink2 uppercase tracking-wider text-right">Used (TB)</th>
              <th className="py-3 px-4 text-xs font-bold text-ink2 uppercase tracking-wider text-right">Capacity (TB)</th>
              <th className="py-3 px-4 text-xs font-bold text-ink2 uppercase tracking-wider text-center">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {data.buckets.map((bucket, index) => {
              const bucketUsed = (bucket.usedTb / bucket.capacityTb) * 100;
              return (
                <tr key={index} className="border-b border-bb2 hover:bg-row-hover transition-colors">
                  <td className="py-3 px-4 font-medium text-navy flex items-center gap-2">
                    <HardDrive size={14} className="text-ink3" />
                    {bucket.name}
                  </td>
                  <td className="py-3 px-4 text-right text-ink2 font-mono">{bucket.usedTb}</td>
                  <td className="py-3 px-4 text-right text-ink2 font-mono">{bucket.capacityTb}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${bucketUsed > 80 ? 'bg-red/10 text-red' : 'bg-green/10 text-green'}`}>
                      {bucketUsed.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default StorageMonitoring;
