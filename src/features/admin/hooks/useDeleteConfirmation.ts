/**
 * useDeleteConfirmation Hook
 * 
 * Custom hook for managing delete confirmations in the admin panel.
 * Provides a reusable pattern for confirming deletions with proper UI feedback.
 * 
 * @example
 * ```tsx
 * const { confirmDelete, DeleteConfirmDialog } = useDeleteConfirmation();
 * 
 * const handleDelete = async (id: string) => {
 *   const confirmed = await confirmDelete({
 *     itemName: 'news item',
 *     title: 'Delete News Item'
 *   });
 *   
 *   if (confirmed) {
 *     await deleteNewsItem(id);
 *   }
 * };
 * 
 * return (
 *   <>
 *     <button onClick={() => handleDelete(item.id)}>Delete</button>
 *     <DeleteConfirmDialog />
 *   </>
 * );
 * ```
 */

import { useConfirm } from '@/shared/hooks';

interface DeleteConfirmOptions {
  /** Name of the item being deleted (e.g., "news item", "blog post") */
  itemName: string;
  /** Optional custom title for the confirmation dialog */
  title?: string;
  /** Optional custom message for the confirmation dialog */
  message?: string;
}

export const useDeleteConfirmation = () => {
  const { showConfirm, ConfirmDialog } = useConfirm();

  /**
   * Show delete confirmation dialog
   * @param options - Configuration for the delete confirmation
   * @returns Promise that resolves to true if user confirms deletion
   */
  const confirmDelete = async (options: DeleteConfirmOptions): Promise<boolean> => {
    const {
      itemName,
      title = `Delete ${itemName.charAt(0).toUpperCase() + itemName.slice(1)}`,
      message = `Are you sure you want to delete this ${itemName}? This action cannot be undone.`
    } = options;

    return await showConfirm({
      title,
      message,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
  };

  return {
    confirmDelete,
    DeleteConfirmDialog: ConfirmDialog
  };
};
