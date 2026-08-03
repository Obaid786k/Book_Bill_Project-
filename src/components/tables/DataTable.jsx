import React from 'react';
import { clsx } from 'clsx';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '../feedback/Skeleton';

export const DataTable = ({
  columns,
  data,
  isLoading = false,
  emptyState,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = "Search...",
  sortConfig,
  onSort,
  pagination,
  className
}) => {
  return (
    <div className={clsx("flex flex-col w-full", className)}>
      {/* Toolbar */}
      {(onSearchChange || pagination) && (
        <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
          {onSearchChange && (
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-ink3" />
              </div>
              <input
                type="text"
                className="w-full pl-9 pr-3 py-1.5 text-[12px] bg-white border border-bb rounded-md focus:border-navy focus:outline-none transition-colors font-body"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}
          {/* Add optional filter slot here if needed later */}
        </div>
      )}

      {/* Table Container */}
      <div className="w-full overflow-x-auto border border-bb2 rounded-[5px] bg-white">
        <table className="w-full border-collapse text-[11.5px] text-ink">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={clsx(
                    "bg-navy text-white text-[9.5px] font-bold uppercase tracking-[0.4px] px-3 py-[7px] border border-navy-dk select-none",
                    col.sortable && onSort ? "cursor-pointer hover:bg-navy-lt" : "",
                    col.align === 'left' ? 'text-left' : col.align === 'right' ? 'text-right' : 'text-center'
                  )}
                  onClick={() => col.sortable && onSort && onSort(col.key)}
                >
                  <div className={clsx(
                    "flex items-center gap-1",
                    col.align === 'left' ? 'justify-start' : col.align === 'right' ? 'justify-end' : 'justify-center'
                  )}>
                    {col.label}
                    {col.sortable && sortConfig?.key === col.key && (
                      sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Loading State
              Array.from({ length: 5 }).map((_, rowIdx) => (
                <tr key={`skel-${rowIdx}`} className="border-b border-bb2 even:bg-row-alt">
                  {columns.map((col, colIdx) => (
                    <td key={`skel-${rowIdx}-${colIdx}`} className="p-2 border-r border-bb2 last:border-r-0">
                      <Skeleton className="h-4 w-full rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="p-8 text-center bg-white">
                  {emptyState || <div className="text-ink3 font-medium">No data available</div>}
                </td>
              </tr>
            ) : (
              // Data Rows
              data.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="even:bg-row-alt transition-colors hover:bg-bg/50">
                  {columns.map((col, colIdx) => (
                    <td
                      key={`${row.id || rowIdx}-${col.key || colIdx}`}
                      className={clsx(
                        "px-3 py-2 border border-bb2 font-mono text-[11px]",
                        col.align === 'left' ? 'text-left' : col.align === 'right' ? 'text-right' : 'text-center',
                        col.className
                      )}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && data.length > 0 && !isLoading && (
        <div className="flex items-center justify-between mt-3 text-[11.5px] text-ink2 px-1">
          <div>
            Showing <span className="font-semibold text-ink">{pagination.startIndex + 1}</span> to <span className="font-semibold text-ink">{Math.min(pagination.endIndex, pagination.total)}</span> of <span className="font-semibold text-ink">{pagination.total}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="p-1 rounded border border-bb bg-white text-ink hover:bg-row-alt disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 font-medium">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-1 rounded border border-bb bg-white text-ink hover:bg-row-alt disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
