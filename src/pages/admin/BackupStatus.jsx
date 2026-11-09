import React from 'react';
import { adminService, formatBytes, SUPABASE_DASHBOARD_URL } from '../../services/adminService';
import { DatabaseBackup, Info, ExternalLink } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { useAdminData } from './useAdminData';
import { AdminError, AdminHeader } from './AdminParts';

export const BackupStatus = () => {
  const { data, error } = useAdminData(adminService.getStorageMonitoring);

  if (error) return <AdminError message={error} />;
  if (!data) return <div className="p-8">Loading backup status...</div>;

  return (
    <div>
      <AdminHeader title="Backup & Recovery" description="Platform snapshot schedule and retention.">
        <StatCard
          compact
          title="Total Payload Size"
          value={formatBytes(data.databaseBytes)}
          subtitle="What one database backup holds"
          icon={DatabaseBackup}
          className="md:w-64 border-l-4 border-l-green"
        />
      </AdminHeader>

      <div className="bg-paper border border-bb2 rounded-lg p-4 mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-navy/[.08] text-navy flex items-center justify-center shrink-0">
            <Info size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-navy">Backups are run by Supabase</h2>
            <p className="text-xs text-ink2">
              The backup list and schedule are kept outside the database, so the app can't read them. See them under Database → Backups.
            </p>
          </div>
        </div>
        <a
          href={SUPABASE_DASHBOARD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-bb bg-paper text-[13px] font-semibold text-ink hover:bg-row-alt shrink-0"
        >
          Open Supabase <ExternalLink size={14} />
        </a>
      </div>

      <p className="text-[12.5px] text-ink2">
        Files (photos) are not part of database backups: {formatBytes(data.fileBytes)} in {data.totalFiles.toLocaleString('en-IN')} files.
      </p>
    </div>
  );
};

export default BackupStatus;
