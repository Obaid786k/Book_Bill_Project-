import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from './Button';

export const DataTable = ({ 
  data, 
  columns, 
  actions, 
  emptyState, 
  emptyMessage = "No data available.", 
  getRowClass,
  isLoading = false,
  searchable = true,
  defaultPageSize = 50
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Helper to extract value from row based on accessor
  const getValue = (row, accessor) => {
    if (typeof accessor === 'function') return accessor(row);
    if (typeof accessor === 'string') {
      return accessor.split('.').reduce((obj, key) => (obj ? obj[key] : undefined), row);
    }
    return undefined;
  };

  // 1. Search Filtering
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    
    return data.filter(row => {
      // Check every column for a match
      return columns.some(col => {
        const val = getValue(row, col.accessor);
        if (val == null) return false;
        // React nodes can't be easily searched this way, so we just stringify basic types
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(lowerSearch);
        }
        return false;
      });
    });
  }, [data, searchTerm, columns]);

  // 2. Sorting
  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const col = columns[sortConfig.columnIndex];
        let aValue = getValue(a, col.accessor);
        let bValue = getValue(b, col.accessor);
        
        // Handle React elements (like StatusBadge) by extracting raw string if possible, or fallback
        if (React.isValidElement(aValue)) aValue = '';
        if (React.isValidElement(bValue)) bValue = '';

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig, columns]);

  // 3. Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const currentData = sortedData.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );

  // Reset page when search or page size changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  const requestSort = (index) => {
    if (!columns[index].sortable) return;
    let direction = 'ascending';
    if (sortConfig && sortConfig.columnIndex === index && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ columnIndex: index, direction });
  };

  if (!data || data.length === 0) {
    if (emptyState) return emptyState;
    return (
      <div className="bg-paper border border-border rounded-lg shadow-sm p-12 text-center">
        <p className="text-ink2 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-paper border border-border rounded-lg shadow-sm overflow-hidden flex flex-col relative">
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-navy" />
        </div>
      )}

      {/* Toolbar */}
      {searchable && (
        <div className="p-4 border-b border-border bg-white flex items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink3" size={16} />
            <input 
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-bb2 rounded-md focus:outline-none focus:border-navy transition-colors bg-row-alt focus:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-row-alt border-b border-border">
              {columns.map((col, i) => (
                <th 
                  key={i} 
                  onClick={() => requestSort(i)}
                  className={clsx(
                    "px-6 py-4 text-xs font-bold uppercase tracking-wider text-ink3 whitespace-nowrap select-none",
                    col.sortable ? "cursor-pointer hover:text-navy transition-colors" : ""
                  )}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortConfig?.columnIndex === i && (
                      sortConfig.direction === 'ascending' 
                        ? <ChevronUp size={14} className="text-navy" /> 
                        : <ChevronDown size={14} className="text-navy" />
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-ink3 whitespace-nowrap text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border relative">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-ink2 text-sm">
                  No matching records found.
                </td>
              </tr>
            ) : (
              currentData.map((row, rowIndex) => (
                <tr key={rowIndex} className={clsx("hover:bg-row-alt/50 transition-colors", getRowClass?.(row))}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-sm text-ink whitespace-nowrap">
                      {getValue(row, col.accessor)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-right">
                      {actions(row, rowIndex)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs text-ink2 font-medium">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border border-bb2 rounded p-1 focus:outline-none focus:border-navy bg-row-alt"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>
          <span>
            Showing {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} records
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink2 font-medium">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
