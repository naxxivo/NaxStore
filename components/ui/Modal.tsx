
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { backdropAnimation } from '../../lib/animations';
import Icon from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const modalContentAnimation = {
    initial: { scale: 0.9, opacity: 0, y: -20 },
    animate: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
    exit: { scale: 0.9, opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={backdropAnimation}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black/60 z-[90]"
            onClick={onClose}
            aria-hidden="true"
          />
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
              <motion.div
                variants={modalContentAnimation}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative w-full max-w-md bg-[hsl(var(--background))] rounded-2xl shadow-2xl border border-[hsl(var(--border))]"
              >
                  <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))]">
                    <h2 id="modal-title" className="text-2xl font-bold">{title}</h2>
                    <button onClick={onClose} aria-label="Close modal" className="p-1 rounded-full hover:bg-[hsl(var(--accent))]">
                        <Icon name="close" className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="p-6">
                    {children}
                  </div>
              </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;