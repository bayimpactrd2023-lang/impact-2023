/**
 * ConfirmModal Component
 * 
 * A reusable confirmation dialog component that replaces window.confirm()
 * with a modern modal interface using Facebook comment-style aesthetic.
 * 
 * @example
 * ```tsx
 * const [confirmOpen, setConfirmOpen] = useState(false);
 * 
 * <ConfirmModal
 *   isOpen={confirmOpen}
 *   onClose={() => setConfirmOpen(false)}
 *   onConfirm={() => handleDelete()}
 *   title="Delete Item"
 *   message="Are you sure you want to delete this item?"
 *   confirmText="Delete"
 *   variant="danger"
 * />
 * ```
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

export interface ConfirmModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when user confirms action */
  onConfirm: () => void;
  /** Modal title */
  title: string;
  /** Modal message/description */
  message: string;
  /** Text for confirm button (default: "Confirm") */
  confirmText?: string;
  /** Text for cancel button (default: "Cancel") */
  cancelText?: string;
  /** Visual variant for different types of confirmations */
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  /** Show loading state on confirm button */
  isLoading?: boolean;
}

/**
 * Icon mapping for different modal variants
 */
const variantIcons = {
  default: Info,
  danger: XCircle,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
};

/**
 * Color classes for different variants
 */
const variantColors = {
  default: 'text-blue-600 bg-blue-50',
  danger: 'text-red-600 bg-red-50',
  warning: 'text-yellow-600 bg-yellow-50',
  success: 'text-green-600 bg-green-50',
  info: 'text-blue-600 bg-blue-50',
};

/**
 * Button variant mapping
 */
const buttonVariants = {
  default: 'default',
  danger: 'destructive',
  warning: 'default',
  success: 'default',
  info: 'default',
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
}) => {
  const Icon = variantIcons[variant];
  const iconColorClasses = variantColors[variant];
  const buttonVariant = buttonVariants[variant] as 'default' | 'destructive';

  /**
   * Handle confirm action and close modal
   */
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-white rounded-2xl shadow-2xl p-0 border-none overflow-hidden">
        <div className="p-8">
          <DialogHeader className="flex flex-col items-start gap-4 space-y-0">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-50 text-red-500' : iconColorClasses}`}>
                <Icon className="w-6 h-6" />
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
                {title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-500 font-medium leading-relaxed pt-2">
              {message}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-10 flex flex-row gap-4 sm:justify-center w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl border-gray-200 text-gray-600 font-bold hover:bg-gray-50 text-base"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={buttonVariant}
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 h-12 rounded-xl font-bold text-base shadow-lg transition-all active:scale-95 ${
                variant === 'danger' 
                  ? 'bg-[#DC1E3C] hover:bg-[#B91932] text-white shadow-red-100' 
                  : ''
              }`}
            >
              {isLoading ? 'Processing...' : confirmText}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
