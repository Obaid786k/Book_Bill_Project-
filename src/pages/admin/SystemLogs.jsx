import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import { Card } from '../../components/common/Card';
import { DataTable } from '../../components/common/DataTable';
import { AlertCircle, AlertTriangle, Info, Terminal, Filter } from 'lucide-react';
import { clsx } from 'clsx';

export const SystemLogs = () => {
  const [logs, setLogs] = useState(null);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    adminService.getSystemLogs().then(setLogs);
  }, []);

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    
    let filtered = [...logs];

    // Filter by Severity
    if (severityFilter !== 'ALL') {
      filtered = filtered.filter(l => l.level === severityFilter);
    }

    // Filter by Search (Event detail or service)
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(l => 
        l.message.toLowerCase().includes(lowerSearch) || 
        l.service.toLowerCase().includes(lowerSearch)
      );
    }

    // Filter by Date (simple exact match on YYYY-MM-DD)
    if (dateFilter) {
      filtered = filtered.filter(l => {
        const d = new Date(l.timestamp);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}` === dateFilter;
      });
    }

    // Sort: ERROR > WARN > INFO, then Timestamp (newest first)
    const severityWeight = { 'ERROR': 3, 'WARN': 2, 'INFO': 1 };
    
    filtered.sort((a, b) => {
      const weightDiff = severityWeight[b.level] - severityWeight[a.level];
      if (weightDiff !== 0) return weightDiff;
      
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return filtered;
  }, [logs, search, severityFilter, dateFilter]);

  const levelConfig = {
    ERROR: {
      badge: "bg-red text-white", // Solid red for maximum attention
      row: "",
      icon: <AlertCircle size={12} />,
    },
    WARN: {
      badge: "bg-gold-bg text-gold border border-gold", // Outlined gold for medium attention
      row: "",
      icon: <AlertTriangle size={12} />,
    },
    INFO: {
      badge: "bg-bg text-ink3 border border-bb", // Muted for low attention
      row: "",
      icon: <Info size={12} />,
    },
  };

  const columns = [
    {
      header: 'Level',
      accessor: (log) => {
        const cfg = levelConfig[log.level] || levelConfig.INFO;
        return (
          <span className={clsx(
            "flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider w-fit",
            cfg.badge
          )}>
            {cfg.icon}
            {log.level}
          </span>
        );
      }
    },
    {
      header: 'Timestamp',
      accessor: (log) => <span className="font-mono text-[13px] font-medium text-navy">{new Date(log.timestamp).toLocaleString()}</span>
    },
    {
      header: 'Service',
      accessor: (log) => <span className="font-medium text-navy">{log.service}</span>
    },
    {
      header: 'Event Detail',
      accessor: (log) => {
        return (
          <span className="truncate max-w-[300px] block text-ink2">
            {log.message}
          </span>
        );
      }
    },
    {
      header: 'Origin IP',
      accessor: (log) => <span className="font-mono text-[13px] text-ink3">{log.ip}</span>
    }
  ];

  // Row class getter for DataTable
  const getRowClass = (log) => levelConfig[log.level]?.row || '';

  if (!logs) return <div className="p-8">Loading logs...</div>;

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">System Logs</h1>
          <p className="text-sm text-ink2 mt-1">Real-time operational events from microservices.</p>
        </div>
      </div>

      {/* Always Visible Quick Filters */}
      <div className="bg-paper border border-bb2 rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-end shadow-sm">
        <div className="flex items-center gap-2 mb-1 w-full text-sm font-bold text-navy border-b border-bb2 pb-2">
          <Filter size={16} /> Quick Filters
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-ink3 uppercase tracking-wider mb-1">Search Event/Service</label>
          <input 
            type="text" 
            placeholder="Search logs..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-bb2 rounded px-3 py-2 text-sm focus:border-navy outline-none"
          />
        </div>

        <div className="w-[150px]">
          <label className="block text-xs font-bold text-ink3 uppercase tracking-wider mb-1">Severity</label>
          <select 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full border border-bb2 rounded px-3 py-2 text-sm focus:border-navy outline-none bg-white"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">Info</option>
            <option value="WARN">Warning</option>
            <option value="ERROR">Error</option>
          </select>
        </div>

        <div className="w-[180px]">
          <label className="block text-xs font-bold text-ink3 uppercase tracking-wider mb-1">Date</label>
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full border border-bb2 rounded px-3 py-2 text-sm focus:border-navy outline-none"
          />
        </div>
        
        <div className="flex items-center">
          <button 
            onClick={() => { setSearch(''); setSeverityFilter('ALL'); setDateFilter(''); }}
            className="px-4 py-2 text-sm font-medium text-navy hover:bg-row-hover rounded transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-navy font-bold text-sm mb-4">
        <Terminal size={16} /> Live Tail ({filteredLogs.length} events)
      </div>
      
      <DataTable 
        data={filteredLogs} 
        columns={columns}
        getRowClass={getRowClass}
        emptyMessage="No logs match the current filters." 
      />
    </div>
  );
};

export default SystemLogs;
