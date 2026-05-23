'use client';

import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-thunder">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3 py-2 text-sm border rounded-md transition-all duration-200 
            ${error ? 'border-cardinal ring-1 ring-cardinal' : 'border-border'} 
            focus:ring-2 focus:ring-cardinal focus:ring-offset-2 focus:outline-none
            placeholder:text-slate/50 ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-cardinal">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
