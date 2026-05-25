'use client';

interface BadgeProps {
  variant: 'success' | 'warning' | 'info' | 'error' | 'default';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variants = {
  success: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  warning: 'bg-amber-50 text-amber-600 border border-amber-100',
  info: 'bg-blue-50 text-blue-600 border border-blue-100',
  error: 'bg-red-50 text-red-600 border border-red-100',
  default: 'bg-slate-50 text-slate-500 border border-slate-100',
};

const dotColors = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
  error: 'bg-red-500',
  default: 'bg-slate-400',
};

export default function Badge({ variant, children, className = '', dot = false }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
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

  const config = statusMap[status] || { variant: 'default' as const, label: status };
  return <Badge variant={config.variant} dot>{config.label}</Badge>;
}
