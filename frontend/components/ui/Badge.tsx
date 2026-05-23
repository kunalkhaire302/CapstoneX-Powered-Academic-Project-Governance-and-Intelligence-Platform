'use client';

interface BadgeProps {
  variant: 'success' | 'warning' | 'info' | 'error' | 'default';
  children: React.ReactNode;
  className?: string;
}

const variants = {
  success: 'bg-[#DCFCE7] text-[#16A34A]',
  warning: 'bg-[#FEF3C7] text-[#F59E0B]',
  info: 'bg-[#DBEAFE] text-[#2563EB]',
  error: 'bg-[#FEE2E2] text-[#D2232A]',
  default: 'bg-[#F3F4F6] text-[#666666]',
};

export default function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
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
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
