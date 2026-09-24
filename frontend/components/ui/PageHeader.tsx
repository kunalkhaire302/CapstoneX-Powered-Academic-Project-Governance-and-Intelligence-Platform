'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Button from './Button';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 page-reveal", className)}>
      <div className="space-y-1.5 flex-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-[28px] font-display text-cx-text font-semibold tracking-tight">
            {title}
          </h1>
          {badge && <div className="mt-1">{badge}</div>}
        </div>
        {description && (
          <p className="text-sm text-cx-text-secondary max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-2.5 flex-shrink-0 mt-2 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
