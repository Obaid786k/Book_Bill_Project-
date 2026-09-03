import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import { DataTable } from '../../components/common/DataTable';
import { Activity, Clock, Zap, AlertTriangle } from 'lucide-react';

export const Performance = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminService.getPerformanceMetrics().then(setData);
  }, []);

  if (!data) return <div className="p-8">Loading performance data...</div>;

  const endpointData = [
    { id: 1, route: 'POST /api/v1/invoices', avgTime: '124ms', p99Time: '310ms', errorRate: '0.01%' },
    { id: 2, route: 'GET /api/v1/products', avgTime: '45ms', p99Time: '89ms', errorRate: '0.00%' },
    { id: 3, route: 'GET /api/v1/customers/search', avgTime: '210ms', p99Time: '540ms', errorRate: '0.05%' },
    { id: 4, route: 'POST /api/v1/auth/login', avgTime: '180ms', p99Time: '420ms', errorRate: '0.12%' },
    { id: 5, route: 'GET /api/v1/reports/monthly', avgTime: '850ms', p99Time: '1.2s', errorRate: '0.00%' },
  ];

  const columns = [
    {
      header: 'Endpoint Route',
      accessor: (row) => <span className="font-mono text-sm text-navy font-bold">{row.route}</span>
    },
    {
      header: 'Avg Response Time',
      accessor: (row) => <span className="font-mono text-sm text-ink2">{row.avgTime}</span>
    },
    {
      header: 'p99 Latency',
      accessor: (row) => <span className="font-mono text-sm text-ink2">{row.p99Time}</span>
    },
    {
      header: 'Error Rate',
      accessor: (row) => (
        <span className={`font-mono text-sm font-bold ${parseFloat(row.errorRate) > 0.05 ? 'text-red' : 'text-green'}`}>
          {row.errorRate}
        </span>
      )
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-ink">API Performance</h1>
        <p className="text-sm text-ink2 mt-1">Platform-wide routing and response metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          compact
          title="Avg Response Time"
          value={`${data.avgResponseTimeMs} ms`}
          icon={Clock}
        />
        <StatCard 
          compact
          title="p99 Response Time"
          value={`${data.p99ResponseTimeMs} ms`}
          icon={Activity}
        />
        <StatCard 
          compact
          title="Error Rate"
          value={data.errorRate}
          icon={AlertTriangle}
          className="border-l-4 border-l-green"
        />
        <StatCard 
          compact
          title="Requests / Min"
          value={`${(data.requestsPerMinute / 1000).toFixed(1)}k`}
          icon={Zap}
        />
      </div>
      
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-navy uppercase tracking-wider">Endpoint Telemetry</h2>
      </div>

      <DataTable 
        data={endpointData}
        columns={columns}
      />
    </div>
  );
};

export default Performance;
