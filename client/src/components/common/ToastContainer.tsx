import React from 'react';
import { useToastStore, ToastItem } from '../../store/toastStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-[120] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast: ToastItem) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-center gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200',
              isSuccess &&
                'bg-white/95 dark:bg-[#0D0D0D]/95 text-[#2C1810] dark:text-slate-100 border-emerald-500/30 dark:border-emerald-500/30 shadow-emerald-500/5',
              isError &&
                'bg-white/95 dark:bg-[#0D0D0D]/95 text-[#2C1810] dark:text-slate-100 border-rose-500/30 dark:border-rose-500/30 shadow-rose-500/5',
              !isSuccess &&
                !isError &&
                'bg-white/95 dark:bg-[#0D0D0D]/95 text-[#2C1810] dark:text-slate-100 border-maroon-200/30 dark:border-[#821946]/30 shadow-maroon-900/5'
            )}
          >
            <div className="flex-shrink-0">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-500" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-maroon-700 dark:text-[#E66E9F]" />}
            </div>

            <p className="text-xs font-medium flex-1 leading-snug">{toast.message}</p>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="flex-shrink-0 p-1 rounded-lg text-[#7C6E65] hover:text-[#4A3B32] dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
