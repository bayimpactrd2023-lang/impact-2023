/**
 * Generic CRUD Operations Hook
 * 
 * This hook provides reusable CRUD operations for any entity type.
 * It follows the Single Responsibility Principle by handling only data operations.
 * 
 * @template T - The type of entity being managed
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface CrudOperations<T extends { id: string }> {
  items: T[];
  setItems: (items: T[]) => void;
  addItem: (item: T) => void;
  updateItem: (id: string, updates: Partial<T>) => void;
  deleteItem: (id: string) => void;
  saveAll: (updateFn: (items: T[]) => void, successMessage: string) => void;
}

/**
 * Custom hook for managing CRUD operations on any entity type
 * 
 * @param initialItems - Initial array of items
 * @returns Object containing CRUD operation methods
 */
export function useCrudOperations<T extends { id: string }>(
  initialItems: T[]
): CrudOperations<T> {
  const [items, setItems] = useState<T[]>(initialItems);

  /**
   * Add a new item to the collection
   */
  const addItem = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, []);

  /**
   * Update specific fields of an item by ID
   */
  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  /**
   * Delete an item by ID
   */
  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  /**
   * Save all items using the provided update function
   */
  const saveAll = useCallback(
    (updateFn: (items: T[]) => void, successMessage: string) => {
      updateFn(items);
      toast.success(successMessage);
    },
    [items]
  );

  return {
    items,
    setItems,
    addItem,
    updateItem,
    deleteItem,
    saveAll,
  };
}
