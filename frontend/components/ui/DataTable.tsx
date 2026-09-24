'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import EmptyState from './EmptyState';
import { TableRowSkeleton } from './Skeleton';

export interface ColumnDef<T> {
  header: ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export default function DataTable<T>({
  data,
  columns,
  loading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There is no data to display in this table.',
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn("w-full overflow-x-auto border border-cx-border rounded-xl bg-cx-surface shadow-xs", className)}>
        <table className="cx-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={col.className}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <TableRowSkeleton columns={columns.length} />
            <TableRowSkeleton columns={columns.length} />
            <TableRowSkeleton columns={columns.length} />
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn("w-full border border-cx-border rounded-xl bg-cx-surface shadow-xs overflow-hidden", className)}>
        <EmptyState title={emptyTitle} description={emptyDescription} compact />
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-x-auto border border-cx-border rounded-xl bg-cx-surface shadow-xs", className)}>
      <table className="cx-table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={col.className}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={cn(onRowClick && 'cursor-pointer hover:bg-cx-bg-subtle transition-colors')}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={col.className}>
                  {col.cell ? col.cell(row) : (col.accessorKey ? String(row[col.accessorKey]) : null)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
