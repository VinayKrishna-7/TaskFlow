import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  differenceInCalendarDays,
  isPast,
  startOfDay,
} from 'date-fns';

export interface DueStatus {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  exactDate: string;
  color: string;
}

export function getDueStatus(dueDate?: string | Date | null, isCompleted = false): DueStatus | null {
  if (!dueDate) return null;

  const date = new Date(dueDate);
  if (isNaN(date.getTime())) return null;

  const exactDate = format(date, 'MMM d, yyyy');
  const todayStart = startOfDay(new Date());
  const dateStart = startOfDay(date);
  const diffDays = differenceInCalendarDays(dateStart, todayStart);

  if (isToday(date)) {
    return {
      label: 'Today',
      isOverdue: false,
      isToday: true,
      isTomorrow: false,
      exactDate,
      color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60',
    };
  }

  if (isTomorrow(date)) {
    return {
      label: 'Tomorrow',
      isOverdue: false,
      isToday: false,
      isTomorrow: true,
      exactDate,
      color: 'text-maroon-700 dark:text-blue-300 bg-maroon-50 dark:bg-blue-950/40 border border-maroon-200 dark:border-blue-800/60',
    };
  }

  if (diffDays > 1 && diffDays <= 7) {
    return {
      label: `In ${diffDays} days`,
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
      exactDate,
      color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-[#E6DACB] dark:border-slate-700',
    };
  }

  // If in the past (and not today)
  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    const label = overdueDays === 1 ? 'Overdue (yesterday)' : `Overdue (${overdueDays}d ago)`;
    return {
      label: isCompleted ? format(date, 'MMM d') : label,
      isOverdue: !isCompleted,
      isToday: false,
      isTomorrow: false,
      exactDate,
      color: isCompleted
        ? 'text-[#7C6E65] dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-[#E6DACB] dark:border-slate-700'
        : 'text-rose-700 dark:text-blue-400 bg-rose-50 dark:bg-blue-950/40 border border-rose-200 dark:border-blue-800/60',
    };
  }

  return {
    label: format(date, 'MMM d'),
    isOverdue: false,
    isToday: false,
    isTomorrow: false,
    exactDate,
    color: 'text-[#7C6E65] dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-[#E6DACB] dark:border-slate-700',
  };
}
