import React from 'react';
import { cn } from '../../lib/utils';
import { TaskPriority, TaskStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'status' | 'priority' | 'outline' | 'custom';
  status?: TaskStatus;
  priority?: TaskPriority;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  priority,
  className,
}) => {
  let styleClasses = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

  if (variant === 'status' && status) {
    switch (status) {
      case 'TODO':
        styleClasses = 'bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
        break;
      case 'IN_PROGRESS':
        styleClasses = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60';
        break;
      case 'IN_REVIEW':
        styleClasses = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60';
        break;
      case 'COMPLETED':
        styleClasses = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60';
        break;
    }
  }

  if (variant === 'priority' && priority) {
    switch (priority) {
      case 'LOW':
        styleClasses = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
        break;
      case 'MEDIUM':
        styleClasses = 'bg-blue- text-blue- dark:bg-blue-/60 dark:text-blue- font-medium';
        break;
      case 'HIGH':
        styleClasses = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-semibold';
        break;
      case 'URGENT':
        styleClasses = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold';
        break;
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide',
        styleClasses,
        className
      )}
    >
      {children}
    </span>
  );
};