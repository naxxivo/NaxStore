
import React from 'react';
import { useToastStore } from '../../lib/toastStore';
import { AnimatePresence, motion } from 'framer-motion';
import Button from './Button';
import { cn } from '../../lib/utils';

const Toasts: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[100]"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className={cn(
                'max-w-md w-full bg-[hsl(var(--card))] shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5',
                {
                  'bg-green-500/20 text-green-800 dark:text-green-200': toast.type === 'success',
                  'bg-blue-500/20 text-blue-800 dark:text-blue-200': toast.type === 'info',
                }
              )}
            >
              <div className="w-0 flex-1 p-4">
                <div className="flex items-start">
                  <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-medium">{toast.message}</p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-[hsl(var(--border))]">
                {toast.action && (
                  <button
                    onClick={() => {
                        toast.action?.onClick();
                        removeToast(toast.id);
                    }}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[hsl(var(--primary))] hover:text-[hsl(var(--primary)/0.8)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Toasts;
