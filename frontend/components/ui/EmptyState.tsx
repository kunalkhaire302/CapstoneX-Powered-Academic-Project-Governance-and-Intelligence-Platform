'use client';

import { ReactNode } from 'react';
import { AlertCircle, FileQuestion, Inbox, RefreshCw, Search } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'search' | 'error' | 'no-permission';
  className?: string;
  compact?: boolean;
}

const variantIcons = {
  default: Inbox,
  search: Search,
  error: AlertCircle,
  'no-permission': FileQuestion,
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  className = '',
  compact = false,
}: EmptyStateProps) {
  const IconComponent = variantIcons[variant];

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'py-8 px-4' : 'py-16 px-6'
      } ${className}`}
      role="status"
      aria-label={title}
    >
      <div
        className={`flex items-center justify-center rounded-xl bg-cx-bg-muted mb-4 ${
          compact ? 'w-10 h-10' : 'w-14 h-14'
        }`}
      >
        {icon || (
          <IconComponent
            className={`text-cx-text-muted ${compact ? 'w-5 h-5' : 'w-7 h-7'}`}
            strokeWidth={1.5}
          />
        )}
      </div>

      <h3
        className={`font-semibold text-cx-text ${
          compact ? 'text-sm' : 'text-base'
        }`}
      >
        {title}
      </h3>

      {description && (
        <p
          className={`mt-1.5 text-cx-text-muted max-w-sm leading-relaxed ${
            compact ? 'text-xs' : 'text-sm'
          }`}
        >
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-5 flex items-center gap-3">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              size={compact ? 'sm' : 'md'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              size={compact ? 'sm' : 'md'}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Error State ──────────────────────────────────────────────────────── */

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We couldn't load this content. Please try again.',
  onRetry,
  compact = false,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'py-6 px-4' : 'py-12 px-6'
      } ${className}`}
      role="alert"
    >
      <div
        className={`flex items-center justify-center rounded-xl bg-red-50 mb-3 ${
          compact ? 'w-10 h-10' : 'w-12 h-12'
        }`}
      >
        <AlertCircle
          className={`text-red-500 ${compact ? 'w-5 h-5' : 'w-6 h-6'}`}
          strokeWidth={1.5}
        />
      </div>
      <h3 className={`font-semibold text-cx-text ${compact ? 'text-sm' : 'text-base'}`}>
        {title}
      </h3>
      <p className={`mt-1 text-cx-text-muted max-w-sm ${compact ? 'text-xs' : 'text-sm'}`}>
        {message}
      </p>
      {onRetry && (
        <Button
          variant="secondary"
          size={compact ? 'sm' : 'md'}
          onClick={onRetry}
          className="mt-4"
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Try again
        </Button>
      )}
    </div>
  );
}

/* ── Loading State ────────────────────────────────────────────────────── */

interface LoadingStateProps {
  message?: string;
  compact?: boolean;
  className?: string;
}

export function LoadingState({
  message = 'Loading...',
  compact = false,
  className = '',
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'py-6' : 'py-12'
      } ${className}`}
      role="status"
      aria-label={message}
    >
      <div className="relative">
        <div className="w-8 h-8 border-2 border-cx-border rounded-full" />
        <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-t-cardinal rounded-full animate-spin" />
      </div>
      <p className="mt-3 text-sm text-cx-text-muted">{message}</p>
    </div>
  );
}
