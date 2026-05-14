/**
 * useConfirm Hook
 * 
 * Custom hook for managing confirmation dialogs throughout the application.
 * Provides a simple API to show confirmation modals and handle user responses.
 * 
 * @example
 * ```tsx
 * const { showConfirm, ConfirmDialog } = useConfirm();
 * 
 * const handleDelete = async () => {
 *   const confirmed = await showConfirm({
 *     title: 'Delete Item',
 *     message: 'Are you sure you want to delete this item?',
 *     variant: 'danger'
 *   });
 *   
 *   if (confirmed) {
 *     // Perform delete action
 *   }
 * };
 * 
 * return (
 *   <>
 *     <button onClick={handleDelete}>Delete</button>
 *     <ConfirmDialog />
 *   </>
 * );
 * ```
 */

import * as React from 'react';
import { ConfirmModal } from '../components/modals';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

export const useConfirm = () => {
  const [state, setState] = React.useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default',
    resolve: null,
  });

  /**
   * Show confirmation dialog and return a promise
   * @param options - Configuration for the confirmation dialog
   * @returns Promise that resolves to true if confirmed, false if cancelled
   */
  const showConfirm = React.useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        ...options,
        resolve,
      });
    });
  }, []);

  /**
   * Handle user confirmation
   */
  const handleConfirm = React.useCallback(() => {
    if (state.resolve) {
      state.resolve(true);
    }
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [state.resolve]);

  /**
   * Handle user cancellation
   */
  const handleCancel = React.useCallback(() => {
    if (state.resolve) {
      state.resolve(false);
    }
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [state.resolve]);

  /**
   * Render the confirmation dialog component
   */
  const ConfirmDialog = React.useCallback(() => (
    <ConfirmModal
      isOpen={state.isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={state.title}
      message={state.message}
      confirmText={state.confirmText}
      cancelText={state.cancelText}
      variant={state.variant}
    />
  ), [state, handleCancel, handleConfirm]);

  return {
    showConfirm,
    ConfirmDialog,
  };
};
