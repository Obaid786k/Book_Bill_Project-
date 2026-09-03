import React from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  isLoading = false,
  icon: Icon = AlertCircle,
  iconColorClass = "text-gold",
  overlayClassName
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} overlayClassName={overlayClassName}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 text-ink2 text-[13px] leading-relaxed">
          <div className={`mt-0.5 flex-shrink-0 ${iconColorClass}`}>
            <Icon size={18} />
          </div>
          <div>
            {message}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
