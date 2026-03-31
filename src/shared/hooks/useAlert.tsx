/**
 * useAlert Hook
 * 
 * Custom hook for managing alert dialogs throughout the application.
 * Provides a simple API to show alert modals to inform users.
 * 
 * @example
 * ```tsx
 * const { showAlert, AlertDialog } = useAlert();
 * 
 * const handleSessionExpired = () => {
 *   showAlert({
 *     title: 'Session Expired',
 *     message: 'Your session has expired. Please log in again.',
 *     variant: 'warning'
 *   });
 * };
 * 
 * return (
 *   <>
 *     <button onClick={handleSessionExpired}>Test Alert</button>
 *     <AlertDialog />
 *   </>
 * );
 * ```
 */

import * as React from 'react';
import { AlertModal } from '../components/modals';

interface AlertOptions {
  title: string;
  message: string;
  buttonText?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
}

interface AlertState extends AlertOptions {
  isOpen: boolean;
}

export const useAlert = () => {
  const [state, setState] = React.useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    buttonText: 'OK',
    variant: 'info',
  });

  /**
   * Show alert dialog
   * @param options - Configuration for the alert dialog
   */
  const showAlert = React.useCallback((options: AlertOptions) => {
    setState({
      isOpen: true,
      ...options,
    });
  }, []);

  /**
   * Close alert dialog
   */
  const handleClose = React.useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * Render the alert dialog component
   */
  const AlertDialog = React.useCallback(() => (
    <AlertModal
      isOpen={state.isOpen}
      onClose={handleClose}
      title={state.title}
      message={state.message}
      buttonText={state.buttonText}
      variant={state.variant}
    />
  ), [state, handleClose]);

  return {
    showAlert,
    AlertDialog,
  };
};
