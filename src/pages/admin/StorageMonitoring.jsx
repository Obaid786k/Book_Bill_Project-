import React from 'react';
import { adminService, formatBytes } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { HardDrive, Database, Files } from 'lucide-react';
import { useAdminData } from './useAdminData';
import { AdminError, AdminHeader } from './AdminParts';

export const StorageMonitoring = () => {
  const { data, error } = useAdminData(adminService.getStorageMonitoring);

  if (error) return <AdminError message={error} />;
  if (!data) return <div className="p-8">Loading storage info...</div>;

  return (
    <div>
      <AdminHeader title="Storage Monitoring" description="Database and file storage used by the whole platform." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard compact title="Total Storage Used" value={formatBytes(data.totalBytes)} subtitle="Database + files" icon={HardDrive} />
        <StatCard compact title="Database" value={formatBytes(data.databaseBytes)} subtitle="Bills, products, accounts…" icon={Database} />
        <StatCard compact title="Files" value={formatBytes(data.fileBytes)} subtitle={`${data.totalFiles.toLocaleString('en-IN')} files (photos etc.)`} icon={Files} />
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 bg-paper border-b border-bb2">
          <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider">Bucket Allocation</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-row-alt border-b border-bb2">
                <th className="py-3 px-4 text-xs font-bold text-ink2 uppercase tracking-wider">Bucket Name</th>
                <th className="py-3 px-4 text-xs font-bold text-ink2 uppercase tracking-wider text-right">Files</th>
                <th className="py-3 px-4 text-xs font-bold text-ink2 uppercase tracking-wider text-right">Used</th>
                <th className="py-3 px-4 text-xs font-bold text-ink2 uppercase tracking-wider text-right">Max file size</th>
                <th className="py-3 px-4 text-xs font-bold text-ink2 uppercase tracking-wider text-center">Access</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data.buckets.length === 0 && (
                <tr><td colSpan={5} className="py-6 px-4 text-center text-ink2">No storage buckets yet.</td></tr>
              )}
              {data.buckets.map((bucket) => (
                <tr key={bucket.name} className="border-b border-bb2 hover:bg-row-hover transition-colors">
                  <td className="py-3 px-4 font-medium text-navy flex items-center gap-2">
                    <HardDrive size={14} className="text-ink3" />
                    {bucket.name}
                  </td>
                  <td className="py-3 px-4 text-right text-ink2 font-mono">{bucket.files.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-ink2 font-mono">{formatBytes(bucket.bytes)}</td>
                  <td className="py-3 px-4 text-right text-ink2 font-mono">{bucket.fileSizeLimit ? formatBytes(bucket.fileSizeLimit) : 'No limit'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${bucket.public ? 'bg-gold/20 text-gold-dk' : 'bg-green/10 text-green'}`}>
                      {bucket.public ? 'Public' : 'Private'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="mt-3 text-[12.5px] text-ink2">Your plan's storage limit is shown in the Supabase dashboard (Settings → Billing).</p>
    </div>
  );
};

export default StorageMonitoring;
