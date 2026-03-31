/**
 * Base Edit Modal Component
 * 
 * A reusable modal component for editing entities.
 * Implements the Template Method Pattern - defines the skeleton,
 * allows subclasses to override specific steps.
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
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
  
  /** Child render function for form fields */
  children: (
    item: T,
    updateField: (field: keyof T, value: any) => void
  ) => React.ReactNode;
  
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
  children,
  validate,
  onUpdateItem,
}: BaseEditModalProps<T>) {
  // Track unsaved changes
  const { hasUnsavedChanges, markAsChanged, markAsSaved } = useUnsavedChanges(editingItem);
  const [originalData, setOriginalData] = useState<T | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { showConfirm, ConfirmDialog } = useConfirm();

  // Store original data when modal opens
  useEffect(() => {
    if (isOpen && editingItem) {
      setOriginalData(JSON.parse(JSON.stringify(editingItem)));
    }
  }, [isOpen, editingItem]);

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
      <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">{title}</DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 pb-6 scrollbar-hide">
          <div className="space-y-6 py-4">
            {/* Render form fields */}
            {children(editingItem, handleUpdateField)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 px-6 pb-6 pt-4 border-t border-gray-100 bg-gray-50">
          <Button
            variant="outline"
            className="flex-1 w-full"
            onClick={handleClose}
          >
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          <Button
            className="flex-1 w-full bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md"
            onClick={handleSave}
          >
            <CheckCircle className="w-4 h-4 mr-2" /> Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    <ConfirmDialog />
    </>
  );
}