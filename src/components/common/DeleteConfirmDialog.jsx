import React from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this? This action cannot be undone.",
  itemName,
  isDeleting = false,
  overlayClassName,
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} overlayClassName={overlayClassName}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 text-ink2 text-[13px] leading-relaxed">
          <div className="mt-0.5 text-red flex-shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div>
            {message}
            {itemName && (
              <div className="mt-2 p-2 bg-row-alt border border-bb2 rounded text-ink font-mono text-[12px] truncate">
                {itemName}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isDeleting}>
            Delete
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
