import React from 'react';
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import { DataTable } from '../../components/common/DataTable';
import { Activity, Clock, Zap, AlertTriangle } from 'lucide-react';
import { useAdminData } from './useAdminData';
import { AdminError, AdminHeader } from './AdminParts';

const ms = (v) => (v == null ? '—' : `${v} ms`);

export const Performance = () => {
  const { data, error } = useAdminData(adminService.getPerformanceMetrics);

  if (error) return <AdminError message={error} />;
  if (!data) return <div className="p-8">Loading performance data...</div>;

  const columns = [
    {
      header: 'Query',
      accessor: (row) => <span className="font-mono text-[12.5px] text-navy block max-w-[520px] truncate" title={row.query}>{row.query}</span>,
    },
    {
      header: 'Calls',
      accessor: (row) => <span className="font-mono text-sm text-ink2">{row.calls.toLocaleString('en-IN')}</span>,
    },
    {
      header: 'Avg Time',
      accessor: (row) => <span className="font-mono text-sm text-ink2">{ms(row.avgMs)}</span>,
    },
    {
      header: 'Slowest',
      accessor: (row) => (
        <span className={`font-mono text-sm font-bold ${row.maxMs > 1000 ? 'text-red' : 'text-green'}`}>{ms(row.maxMs)}</span>
      ),
    },
  ];

  const since = data.statsSince ? new Date(data.statsSince).toLocaleString('en-IN') : 'database start';
  const qpm = data.queriesPerMinute >= 1000 ? `${(data.queriesPerMinute / 1000).toFixed(1)}k` : data.queriesPerMinute.toFixed(1);

  return (
    <div>
      <AdminHeader title="API Performance" description={`Database work done by the app since ${since}.`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard compact title="Avg Response Time" value={ms(data.avgResponseTimeMs)} subtitle="Per app query" icon={Clock} />
        <StatCard compact title="Slowest Query" value={ms(data.maxResponseTimeMs)} subtitle="Single worst run" icon={Activity} />
        <StatCard
          compact
          title="Error Rate"
          value={`${data.failedPct}%`}
          subtitle="Failed database transactions"
          icon={AlertTriangle}
          className={data.failedPct > 1 ? 'border-l-4 border-l-red' : 'border-l-4 border-l-green'}
        />
        <StatCard compact title="Queries / Min" value={data.available ? qpm : '—'} subtitle={`${data.totalQueries.toLocaleString('en-IN')} in total`} icon={Zap} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-navy uppercase tracking-wider">Heaviest app queries</h2>
      </div>

      {data.available ? (
        <DataTable data={data.slowest} columns={columns} emptyMessage="No app queries recorded yet." />
      ) : (
        <p className="p-4 rounded-lg bg-row-alt text-[13px] text-ink2">
          Query timing needs the <b>pg_stat_statements</b> extension. Turn it on in the Supabase dashboard under Database → Extensions.
        </p>
      )}
    </div>
  );
};

export default Performance;
