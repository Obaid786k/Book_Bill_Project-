import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Card } from './Card';

export const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  overlayClassName,
  hideCloseButton = false,
}) => {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={clsx("fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 no-print", overlayClassName)}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-navy-dk/60 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md"
          >
            <Card className={clsx("flex flex-col shadow-2xl", className)}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-bb2">
                <h2 className="text-[14px] font-bold text-navy">{title}</h2>
                {!hideCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-1 rounded hover:bg-row-alt text-ink3 hover:text-ink transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <div className="px-5 py-4">
                {children}
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
