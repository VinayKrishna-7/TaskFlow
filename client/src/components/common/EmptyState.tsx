import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';
import { AlertCircle, RotateCcw } from 'lucide-react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse bg-slate-200/80 dark:bg-slate-800/80 rounded-xl', className)} />
);

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="p-5 bg-[#FFFDF9] dark:bg-[#0D0D0D] border border-[#E6DACB]/80 dark:border-slate-800/80 rounded-2xl shadow-sm space-y-4 animate-pulse"
      >
        <div className="flex justify-between items-center">
          <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="w-12 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="space-y-2">
          <div className="w-3/4 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="w-2/3 h-3.5 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="pt-3 border-t border-[#E6DACB]/60 dark:border-slate-800/80 flex justify-between">
          <div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export const TableRowSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-2 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="flex items-center justify-between p-4 bg-[#FFFDF9] dark:bg-[#0D0D0D] border border-[#E6DACB]/80 dark:border-slate-800/80 rounded-xl"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="w-1/3 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="flex gap-4">
          <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>
    ))}
  </div>
);

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-2xl border border-dashed border-[#E6DACB] dark:border-slate-800/80 my-4 shadow-xs',
      className
    )}
  >
    {icon && (
      <div className="p-3.5 bg-maroon-50 dark:bg-[#38061B]/40 text-maroon-700 dark:text-[#F9CFE2] rounded-2xl mb-3.5 border border-maroon-200 dark:border-[#821946]/50 shadow-xs">
        {icon}
      </div>
    )}
    <h3 className="text-base font-bold text-[#2C1810] dark:text-slate-100 mb-1">{title}</h3>
    <p className="text-xs text-[#7C6E65] dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
      {description}
    </p>
    {actionText && onAction && (
      <Button onClick={onAction} size="sm">
        {actionText}
      </Button>
    )}
  </div>
);

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load content',
  message = 'Please check your internet connection and try again.',
  onRetry,
  className,
}) => (
  <div
    role="alert"
    className={cn(
      'flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-2xl border border-rose-200 dark:border-rose-900/50 my-4 shadow-xs',
      className
    )}
  >
    <div className="p-3 bg-rose-50 dark:bg-[#38061B]/50 text-rose-600 dark:text-[#E66E9F] rounded-2xl mb-3 border border-rose-200 dark:border-rose-900/50">
      <AlertCircle className="w-6 h-6" />
    </div>
    <h3 className="text-base font-bold text-[#2C1810] dark:text-slate-100 mb-1">{title}</h3>
    <p className="text-xs text-[#7C6E65] dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
      {message}
    </p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
        <RotateCcw className="w-3.5 h-3.5" />
        Try Again
      </Button>
    )}
  </div>
);