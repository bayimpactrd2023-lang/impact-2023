/**
 * Modal Management Hook
 * 
 * This hook manages the state of edit modals for any entity type.
 * Implements the Open/Closed Principle - open for extension, closed for modification.
 */

import { useState, useCallback } from 'react';

export interface ModalState<T> {
  isOpen: boolean;
  editingItem: T | null;
}

export interface ModalOperations<T> {
  isOpen: boolean;
  editingItem: T | null;
  openModal: (item: T) => void;
  closeModal: () => void;
  updateEditingItem: (updates: Partial<T>) => void;
}

/**
 * Custom hook for managing modal state and operations
 * 
 * @template T - The type of entity being edited
 * @returns Object containing modal state and operations
 */
export function useModalState<T>(): ModalOperations<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  /**
   * Open modal with the given item for editing
   */
  const openModal = useCallback((item: T) => {
    setEditingItem(item);
    setIsOpen(true);
  }, []);

  /**
   * Close modal and clear editing item
   */
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setEditingItem(null);
  }, []);

  /**
   * Update the currently editing item
   */
  const updateEditingItem = useCallback((updates: Partial<T>) => {
    setEditingItem(prev => (prev ? { ...prev, ...updates } : null));
  }, []);

  return {
    isOpen,
    editingItem,
    openModal,
    closeModal,
    updateEditingItem,
  };
}
