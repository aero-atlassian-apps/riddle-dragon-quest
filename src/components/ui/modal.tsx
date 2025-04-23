
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ModalProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  modalId?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Modal: React.FC<ModalProps> = ({ 
  children, 
  title, 
  description, 
  modalId,
  isOpen = false,
  onClose
}) => {
  // A simple state manager - in a real app this would be connected to a context
  const [open, setOpen] = React.useState(isOpen);
  
  React.useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);
  
  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
