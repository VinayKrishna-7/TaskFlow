import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-[#2C1810] dark:text-slate-300 mb-1.5">
            {label}
            {props.required && <span className="text-rose-500 ml-1" title="Required">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'w-full px-3.5 py-2 bg-[#FFFDF9] dark:bg-[#111827] border rounded-xl text-sm text-[#2C1810] dark:text-slate-100 placeholder-[#7C6E65]/60 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:border-blue-500 dark:focus:ring-blue-500/30 dark:focus:border-blue-500 transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[#F3ECE2] dark:disabled:bg-slate-800/40',
            error ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500/40' : 'border-[#E6DACB] dark:border-slate-700/80',
            className
          )}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-rose-500 font-medium">
            {error}
          </p>
        )}
        {helperText && !error && <p className="mt-1 text-xs text-[#7C6E65] dark:text-slate-400">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';