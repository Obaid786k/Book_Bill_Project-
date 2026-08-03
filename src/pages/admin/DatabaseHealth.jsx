import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Database, HardDrive, Activity } from 'lucide-react';

export const DatabaseHealth = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminService.getDatabaseHealth().then(setData);
  }, []);

  if (!data) return <div className="p-8">Loading database info...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-ink">Database Health</h1>
        <p className="text-sm text-ink2 mt-1">Primary cluster metrics and IOPS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard 
          compact
          title="Cluster Status"
          value={data.clusterStatus}
          icon={Database}
        />
        <StatCard 
          compact
          title="Avg Latency"
          value={`${data.avgLatencyMs} ms`}
          icon={Activity}
        />
        <StatCard 
          compact
          title="Nodes Active"
          value={`${data.nodesActive} / ${data.nodesTotal}`}
          icon={HardDrive}
        />
      </div>
      
      <Card className="p-6">
        <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-6 pb-2 border-b border-bb2">
          Throughput (IOPS)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-medium text-ink2 mb-1">Read Operations</p>
            <p className="text-3xl font-bold text-navy font-mono">{data.readIops}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-ink2 mb-1">Write Operations</p>
            <p className="text-3xl font-bold text-navy font-mono">{data.writeIops}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DatabaseHealth;
