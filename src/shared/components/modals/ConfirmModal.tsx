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
  default: 'text-blue-600',
  danger: 'text-red-600',
  warning: 'text-yellow-600',
  success: 'text-green-600',
  info: 'text-blue-600',
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
  const iconColor = variantColors[variant];
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
      <DialogContent className="sm:max-w-[425px] bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-full bg-gray-50 ${iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-600 leading-relaxed">
            {message}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={buttonVariant}
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 sm:flex-1"
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
