'use client';

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] select-none';

    const variants = {
      primary: 'bg-gradient-to-r from-cardinal to-cardinal-600 text-white hover:from-cardinal-600 hover:to-cardinal-700 focus:ring-cardinal shadow-[0_2px_8px_rgba(210,35,42,0.25)] hover:shadow-[0_4px_16px_rgba(210,35,42,0.35)] hover:-translate-y-[1px]',
      secondary: 'bg-white text-thunder border border-border hover:bg-surface hover:border-slate/30 focus:ring-cardinal hover:shadow-sm hover:-translate-y-[1px]',
      danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-[0_2px_8px_rgba(239,68,68,0.25)]',
      ghost: 'text-slate hover:bg-surface hover:text-thunder focus:ring-cardinal',
    };

    const sizes = {
      sm: 'text-xs px-3 py-2 gap-1.5 min-h-[36px]',
      md: 'text-sm px-4 py-2.5 gap-2 min-h-[40px]',
      lg: 'text-base px-6 py-3 gap-2.5 min-h-[44px]',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-50 cursor-not-allowed !transform-none' : ''} ${className}`}
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
          <span className="w-4 h-4 flex-shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
