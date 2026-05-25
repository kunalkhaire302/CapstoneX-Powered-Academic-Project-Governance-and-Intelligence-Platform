'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-thunder">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate w-4 h-4">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={errorId}
            className={`w-full ${icon ? 'pl-10' : 'px-3.5'} pr-3.5 py-2.5 text-sm border rounded-lg transition-all duration-200 bg-white min-h-[44px]
              ${error 
                ? 'border-red-300 ring-2 ring-red-100 focus:ring-red-200 focus:border-red-400' 
                : 'border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-cardinal/15 focus:border-cardinal'
              } 
              focus:outline-none
              placeholder:text-slate/40 ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="text-xs text-red-500 flex items-center gap-1" role="alert">
            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </p>
        )}
        {helperText && !error && <p className="text-xs text-slate">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
