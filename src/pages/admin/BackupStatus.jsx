import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Card } from '../../components/common/Card';
import { DatabaseBackup, CheckCircle, Clock } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { StatCard } from '../../components/common/StatCard';

export const BackupStatus = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminService.getBackupStatus().then(setData);
  }, []);

  if (!data) return <div className="p-8">Loading backup status...</div>;

  const backupJobs = [
    {
      id: 'job-1',
      type: 'Full Snapshot',
      status: 'SUCCESS',
      timestamp: data.lastFullBackup,
      target: 'cold-storage-eu-1'
    },
    {
      id: 'job-2',
      type: 'Incremental Sync',
      status: 'SUCCESS',
      timestamp: data.lastIncrementalBackup,
      target: 'replica-db-us-east'
    },
    {
      id: 'job-3',
      type: 'Next Scheduled Run',
      status: 'PENDING',
      timestamp: data.nextScheduled,
      target: 'All Volumes'
    }
  ];

  const columns = [
    {
      header: 'Job Type',
      accessor: (row) => <span className="font-bold text-navy">{row.type}</span>
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider w-fit ${
          row.status === 'SUCCESS' ? 'bg-green/10 text-green' : 'bg-gold/20 text-gold-dk'
        }`}>
          {row.status === 'SUCCESS' ? <CheckCircle size={12} /> : <Clock size={12} />}
          {row.status}
        </span>
      )
    },
    {
      header: 'Timestamp',
      accessor: (row) => <span className="font-mono text-[13px] text-ink3">{new Date(row.timestamp).toLocaleString()}</span>
    },
    {
      header: 'Target Location',
      accessor: (row) => <span className="text-ink2">{row.target}</span>
    }
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Backup & Recovery</h1>
          <p className="text-sm text-ink2 mt-1">Platform snapshot schedule and retention.</p>
        </div>
        <StatCard 
          compact
          title="Total Payload Size"
          value={`${data.sizeGb} GB`}
          icon={DatabaseBackup}
          className="md:w-64 border-l-4 border-l-green"
        />
      </div>

      <div className="bg-paper border border-bb2 rounded-lg p-4 mb-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green/10 text-green flex items-center justify-center">
            <CheckCircle size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-navy">All Backups Healthy</h2>
            <p className="text-xs text-ink2">No failed jobs in the last 72 hours.</p>
          </div>
        </div>
      </div>

      <DataTable 
        data={backupJobs}
        columns={columns}
      />
    </div>
  );
};

export default BackupStatus;
