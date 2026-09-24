'use client';

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }, ref) => {
    
    // Base utility classes handled in globals.css (.btn-primary, etc.)
    // We just map the variant prop to the corresponding CSS class.
    
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      danger: 'btn-danger',
      ghost: 'btn-ghost',
      outline: 'btn-secondary', // mapping outline to secondary for now
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs min-h-[32px] gap-1.5',
      md: 'px-4 py-2.5 text-sm min-h-[40px] gap-2',
      lg: 'px-6 py-3 text-base min-h-[48px] gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand select-none',
          variantClasses[variant],
          sizeClasses[size],
          (disabled || loading) && 'opacity-60 cursor-not-allowed transform-none hover:transform-none shadow-none',
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : icon ? (
          <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
