import React from 'react';
import { adminService, formatBytes, runningFor } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Database, HardDrive, Activity, Gauge } from 'lucide-react';
import { useAdminData } from './useAdminData';
import { AdminError, AdminHeader } from './AdminParts';

const fmt = (v) => Number(v || 0).toLocaleString('en-IN');

export const DatabaseHealth = () => {
  const { data, error } = useAdminData(adminService.getDatabaseHealth);

  if (error) return <AdminError message={error} />;
  if (!data) return <div className="p-8">Loading database info...</div>;

  const connPct = data.maxConnections ? (data.connections / data.maxConnections) * 100 : 0;
  const cacheOk = data.cacheHitPct == null || data.cacheHitPct >= 95;
  const healthy = cacheOk && connPct < 80;
  const since = data.statsSince ? new Date(data.statsSince).toLocaleString('en-IN') : 'database start';

  return (
    <div>
      <AdminHeader
        title="Database Health"
        description={`Postgres ${data.version || ''} · running for ${runningFor(data.startedAt)}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          compact
          title="Cluster Status"
          value={healthy ? 'Healthy' : 'Needs attention'}
          subtitle={!cacheOk ? 'Low cache hit rate' : connPct >= 80 ? 'Connections almost full' : 'All checks fine'}
          icon={Database}
          className={healthy ? 'border-l-4 border-l-green' : 'border-l-4 border-l-red'}
        />
        <StatCard
          compact
          title="Cache hit rate"
          value={data.cacheHitPct == null ? '—' : `${data.cacheHitPct}%`}
          subtitle="Reads served from memory (aim 99%)"
          icon={Gauge}
        />
        <StatCard
          compact
          title="Connections"
          value={`${data.connections} / ${data.maxConnections}`}
          subtitle={`${data.activeConnections} running a query now`}
          icon={Activity}
        />
        <StatCard compact title="Database size" value={formatBytes(data.sizeBytes)} subtitle="Tables + indexes" icon={HardDrive} />
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-6 pb-2 border-b border-bb2">
          Throughput (since {since})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="text-sm font-medium text-ink2 mb-1">Rows read</p>
            <p className="text-3xl font-bold text-navy font-mono">{fmt(data.rowsRead)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-ink2 mb-1">Rows written</p>
            <p className="text-3xl font-bold text-navy font-mono">{fmt(data.rowsWritten)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-ink2 mb-1">Deadlocks</p>
            <p className={`text-3xl font-bold font-mono ${data.deadlocks ? 'text-red' : 'text-navy'}`}>{fmt(data.deadlocks)}</p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-4 bg-paper border-b border-bb2">
          <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider">Tables</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-row-alt border-b border-bb2">
                <th className="py-3 px-4 text-xs font-bold text-ink2 uppercase tracking-wider">Table</th>
                <th className="py-3 px-4 text-xs font-bold text-ink2 uppercase tracking-wider text-right">Rows</th>
                <th className="py-3 px-4 text-xs font-bold text-ink2 uppercase tracking-wider text-right">Size</th>
                <th className="py-3 px-4 text-xs font-bold text-ink2 uppercase tracking-wider text-right">Index scans</th>
                <th className="py-3 px-4 text-xs font-bold text-ink2 uppercase tracking-wider text-right">Full scans</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data.tables.map((t) => (
                <tr key={t.name} className="border-b border-bb2 hover:bg-row-hover transition-colors">
                  <td className="py-3 px-4 font-medium text-navy font-mono">{t.name}</td>
                  <td className="py-3 px-4 text-right text-ink2 font-mono">{fmt(t.rows)}</td>
                  <td className="py-3 px-4 text-right text-ink2 font-mono">{formatBytes(t.sizeBytes)}</td>
                  <td className="py-3 px-4 text-right text-ink2 font-mono">{fmt(t.indexScans)}</td>
                  <td className="py-3 px-4 text-right text-ink2 font-mono">{fmt(t.seqScans)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DatabaseHealth;
