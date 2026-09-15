import React from 'react';
import { useConfirmStore } from '../../store/confirmStore';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog: React.FC = () => {
  const { isOpen, options, isLoading, closeConfirm, setLoading } = useConfirmStore();

  if (!isOpen || !options) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await options.onConfirm();
      closeConfirm();
    } catch (err) {
      console.error('Confirmation error:', err);
      setLoading(false);
    }
  };

  const isDanger = options.variant !== 'primary';

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : closeConfirm}
      title={options.title}
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl flex-shrink-0 ${
              isDanger
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                : 'bg-blue- dark:bg-blue-/50 text-blue- dark:text-blue-'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {options.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {options.description || 'This action cannot be undone.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="secondary"
            size="sm"
            type="button"
            disabled={isLoading}
            onClick={closeConfirm}
          >
            {options.cancelText || 'Cancel'}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            size="sm"
            type="button"
            isLoading={isLoading}
            onClick={handleConfirm}
          >
            {options.confirmText || 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
