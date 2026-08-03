import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  width = "w-full max-w-md", // Default width
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
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Overlay matching .tc (Template Cover) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }} // 220ms per motion spec
            className="absolute inset-0 bg-navy-dk/40 backdrop-blur-[1px]"
            onClick={onClose}
          />
          
          {/* Panel matching .tpanel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className={clsx(
              "relative z-10 h-full bg-paper shadow-[-4px_0_24px_rgba(0,0,0,0.12)] flex flex-col border-l border-bb",
              width,
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-bb2 bg-white">
              <h2 className="text-[14px] font-bold text-navy uppercase tracking-[0.5px]">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-row-alt text-ink3 hover:text-ink transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
