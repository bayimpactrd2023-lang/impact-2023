/**
 * AlertModal Component
 * 
 * A reusable alert dialog component that replaces window.alert()
 * with a modern modal interface using Facebook comment-style aesthetic.
 * 
 * @example
 * ```tsx
 * const [alertOpen, setAlertOpen] = useState(false);
 * 
 * <AlertModal
 *   isOpen={alertOpen}
 *   onClose={() => setAlertOpen(false)}
 *   title="Session Expired"
 *   message="Your session has expired. Please log in again."
 *   variant="warning"
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

export interface AlertModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Modal message/description */
  message: string;
  /** Text for close button (default: "OK") */
  buttonText?: string;
  /** Visual variant for different types of alerts */
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
}

/**
 * Icon mapping for different alert variants
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

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK',
  variant = 'info',
}) => {
  const Icon = variantIcons[variant];
  const colorClasses = variantColors[variant];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-full ${colorClasses}`}>
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

        <DialogFooter className="mt-6">
          <Button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto bg-[#1887FC] hover:bg-[#1877DC] text-white"
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
