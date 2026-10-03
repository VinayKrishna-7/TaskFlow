import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer';

  const variants = {
    primary: 'bg-maroon-600 text-[#FFFDF9] hover:bg-maroon-700 focus:ring-maroon-600 shadow-sm shadow-maroon-900/20 active:bg-maroon-800 dark:bg-[#992355] dark:hover:bg-[#BD326D] dark:focus:ring-[#992355] dark:shadow-[#992355]/30',
    secondary: 'bg-[#F3ECE2] text-[#2C1810] hover:bg-[#EBE2D5] focus:ring-[#E6DACB] dark:bg-[#141414] dark:text-slate-100 dark:hover:bg-[#1F1F1F] dark:border dark:border-[#262626]',
    outline: 'border border-[#E6DACB] text-[#2C1810] hover:bg-[#F3ECE2] focus:ring-maroon-600 dark:border-[#262626] dark:text-slate-200 dark:hover:bg-[#141414] dark:hover:border-[#992355]/50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm shadow-rose-500/20 dark:bg-rose-600 dark:hover:bg-rose-500 dark:focus:ring-rose-500',
    ghost: 'text-[#7C6E65] hover:bg-[#F3ECE2] hover:text-[#2C1810] dark:text-slate-400 dark:hover:bg-[#141414] dark:hover:text-slate-100',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
      {children}
    </button>
  );
};