'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'info' | 'error' | 'default' | 'pending';
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

const variantClasses = {
  success: 'badge-success',
  warning: 'badge-warning',
  info: 'badge-info',
  error: 'badge-error',
  pending: 'badge-pending',
  default: 'badge-default',
};

const dotColors = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
  error: 'bg-red-500',
  pending: 'bg-violet-500',
  default: 'bg-slate-400',
};

export default function Badge({ variant = 'default', children, className = '', dot = false }: BadgeProps) {
  return (
    <span className={cn('badge', variantClasses[variant], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  const statusMap: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    completed: { variant: 'success', label: 'Completed' },
    approved: { variant: 'success', label: 'Approved' },
    evaluated: { variant: 'success', label: 'Evaluated' },
    submitted: { variant: 'info', label: 'Submitted' },
    in_progress: { variant: 'info', label: 'In Progress' },
    processing: { variant: 'info', label: 'Processing' },
    pending: { variant: 'warning', label: 'Pending' },
    not_started: { variant: 'warning', label: 'Not Started' },
    revision_requested: { variant: 'warning', label: 'Revision Requested' },
    rejected: { variant: 'error', label: 'Rejected' },
    draft: { variant: 'default', label: 'Draft' },
  };

  const config = statusMap[status?.toLowerCase()] || { variant: 'default' as const, label: status || 'Unknown' };
  
  return (
    <Badge variant={config.variant} dot className={className}>
      {config.label}
    </Badge>
  );
}
