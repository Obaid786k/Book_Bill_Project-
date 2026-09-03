import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

// Stub only, as per docs. Fully implemented in future phases.
export const ProductTour = () => {
  const [isVisible, setIsVisible] = useState(true); // Should be driven by global state normally

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-navy-dk/40 backdrop-blur-[2px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative z-10 w-full max-w-sm"
        >
          <Card className="p-6 text-center border-gold border-t-4">
            <div className="flex justify-end mb-2">
              <button onClick={() => setIsVisible(false)} className="text-ink3 hover:text-ink">
                <X size={16} />
              </button>
            </div>
            <h3 className="text-lg font-bold text-navy mb-2">Welcome to Bill Book!</h3>
            <p className="text-ink2 text-[13px] mb-6">
              This is a placeholder for the interactive product tour. You can skip it for now.
            </p>
            <Button variant="primary" className="w-full" onClick={() => setIsVisible(false)}>
              Skip Tour
            </Button>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
