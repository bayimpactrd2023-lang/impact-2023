/**
 * Base Edit Modal Component
 * 
 * A reusable modal component for editing entities.
 * Implements the Template Method Pattern - defines the skeleton,
 * allows subclasses to override specific steps.
 */

import { ReactNode } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { toast } from 'sonner';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { useConfirm } from '@/shared/hooks/useConfirm';

export interface BaseEditModalProps<T extends { id: string }> {
  /** Whether the modal is open */
  isOpen: boolean;
  
  /** Function to close the modal */
  onClose: () => void;
  
  /** The item being edited */
  editingItem: T | null;
  
  /** Array of all items (to check if new) */
  allItems: T[];
  
  /** Function to save the item */
  onSave: (item: T) => void;
  
  /** Modal title */
  title: string;
  
  /** Modal description */
  description: string;
  
  /** Success message after save */
  successMessage: string;
  
  /** Optional icon to display in the header */
  icon?: ReactNode;

  /** Child render function for form fields */
  children: (
    item: T,
    updateField: (field: keyof T, value: any) => void
  ) => ReactNode;
  
  /** Optional validation function */
  validate?: (item: T) => { isValid: boolean; error?: string };
  
  /** Function to update the editing item */
  onUpdateItem: (updates: Partial<T>) => void;
}

/**
 * Generic base modal for editing entities
 * 
 * This component handles the common modal logic:
 * - Opening/closing
 * - Save button handling
 * - Validation
 * - Success/error messages
 * 
 * The form fields are provided via the children render prop.
 */
export function BaseEditModal<T extends { id: string }>({
  isOpen,
  onClose,
  editingItem,
  allItems,
  onSave,
  title,
  description,
  successMessage,
  icon,
  children,
  validate,
  onUpdateItem,
}: BaseEditModalProps<T>) {
  // Track unsaved changes
  const { hasUnsavedChanges, markAsChanged, markAsSaved } = useUnsavedChanges(editingItem);
  const { showConfirm, ConfirmDialog } = useConfirm();

  /**
   * Handle field updates
   */
  const handleUpdateField = (field: keyof T, value: any) => {
    if (editingItem) {
      onUpdateItem({ [field]: value } as Partial<T>);
      markAsChanged(); // Mark that changes have been made
    }
  };

  /**
   * Handle close with unsaved changes check
   */
  const handleClose = async () => {
    if (hasUnsavedChanges) {
      const confirmed = await showConfirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to close without saving?',
        confirmText: 'Discard Changes',
        cancelText: 'Keep Editing',
        variant: 'warning',
      });
      
      if (!confirmed) return;
    }
    
    markAsSaved();
    onClose();
  };

  /**
   * Handle save button click
   */
  const handleSave = () => {
    if (!editingItem) return;

    // Validate if validation function provided
    if (validate) {
      const validation = validate(editingItem);
      if (!validation.isValid) {
        toast.error(validation.error || 'Validation failed');
        return;
      }
    }

    // Check if this is a new item
    const isNewItem = !allItems.some(item => item.id === editingItem.id);

    // Save the item
    onSave(editingItem);

    // Mark as saved
    markAsSaved();

    // Close modal
    onClose();

    // Show success message
    toast.success(successMessage, {
      description: isNewItem
        ? 'The new item has been added successfully.'
        : 'Your changes have been saved successfully.',
    });
  };

  if (!editingItem) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0 shadow-lg shadow-blue-500/20">
              {icon || <CheckCircle className="w-6 h-6" />}
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">{title}</DialogTitle>
              <DialogDescription className="text-base text-gray-500 mt-0.5 font-medium">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
          <div className="space-y-8 py-6">
            {/* Render form fields */}
            {children(editingItem, handleUpdateField)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 p-6 border-t border-gray-100 shrink-0 bg-gray-50/80 backdrop-blur-sm rounded-b-2xl">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl font-bold text-gray-600 border-gray-200 hover:bg-white hover:border-gray-300 transition-all"
            onClick={handleClose}
          >
            <X className="w-5 h-4 mr-2" /> Cancel
          </Button>
          <Button
            className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:shadow-lg hover:shadow-blue-500/25 text-white transition-all transform hover:-translate-y-0.5"
            onClick={handleSave}
          >
            <CheckCircle className="w-5 h-5 mr-2" /> Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    <ConfirmDialog />
    </>
  );
}